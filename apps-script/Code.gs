const SHEET_ID = "1yLuIezCi-1cSbLGv5ugCLdvxO_xiNVBhRZ5cmifstAk";
const RECEIPT_FOLDER_ID = "1oKZ1DSG0lMdg2MJ9p93xZhFQz-ilPh6x";
const TELEGRAM_LINK = "https://t.me/+bR0TCJJoEgNkYmQ1";

const WORKSHOP = {
  title: "From Text Book to Animation Video",
  date: "11 Oktober 2026 (Ahad)",
  time: "3.00 PM - 4.30 PM",
  platform: "Google Meet",
  fee: "RM 40",
};

function doGet() {
  return jsonResponse({
    ok: true,
    message: "Educreator registration endpoint is ready.",
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = e.parameter || {};
    const fullName = String(data.fullName || "").trim().toUpperCase();
    const schoolName = String(data.schoolName || "").trim();
    const email = String(data.email || "").trim();

    if (!fullName || !schoolName || !email || !data.receiptData) {
      throw new Error("Maklumat pendaftaran tidak lengkap.");
    }

    const receiptFile = saveReceiptFile_(data, fullName);
    const sheet = getRegistrationSheet_();
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      fullName,
      schoolName,
      email,
      receiptFile.getUrl(),
      WORKSHOP.title,
      WORKSHOP.date,
      WORKSHOP.time,
      WORKSHOP.platform,
      WORKSHOP.fee,
      TELEGRAM_LINK,
      data.sourcePage || "",
    ]);

    sendConfirmationEmail_({
      fullName,
      schoolName,
      email,
      receiptUrl: receiptFile.getUrl(),
    });

    return jsonResponse({
      ok: true,
      message: "Pendaftaran berjaya dihantar.",
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message || "Pendaftaran gagal dihantar.",
    });
  } finally {
    lock.releaseLock();
  }
}

function getRegistrationSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet =
    spreadsheet.getSheetByName("Pendaftaran") ||
    spreadsheet.insertSheet("Pendaftaran");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Nama Penuh",
      "Nama Sekolah",
      "Emel",
      "URL Resit",
      "Tajuk Bengkel",
      "Tarikh",
      "Masa",
      "Platform",
      "Amaun Bayaran",
      "Telegram",
      "Source Page",
    ]);
  }

  return sheet;
}

function saveReceiptFile_(data, fullName) {
  const match = String(data.receiptData).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Format resit tidak sah.");
  }

  const mimeType = data.receiptMime || match[1] || "application/octet-stream";
  const originalName = sanitizeFileName_(data.receiptName || "resit");
  const safeName = sanitizeFileName_(fullName);
  const fileName =
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") +
    "-" +
    safeName +
    "-" +
    originalName;

  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folder = DriveApp.getFolderById(RECEIPT_FOLDER_ID);
  return folder.createFile(blob);
}

function sendConfirmationEmail_(participant) {
  const subject = "Pengesahan Pendaftaran Bengkel " + WORKSHOP.title;
  const plainBody =
    "Assalamualaikum dan salam sejahtera " +
    participant.fullName +
    ",\n\n" +
    "Pendaftaran anda untuk bengkel berikut telah diterima.\n\n" +
    "Tajuk: " +
    WORKSHOP.title +
    "\nTarikh: " +
    WORKSHOP.date +
    "\nMasa: " +
    WORKSHOP.time +
    "\nPlatform: " +
    WORKSHOP.platform +
    "\nAmaun Bayaran: " +
    WORKSHOP.fee +
    "\nNama Sekolah: " +
    participant.schoolName +
    "\n\n" +
    "Sila sertai group Telegram bengkel:\n" +
    TELEGRAM_LINK +
    "\n\n" +
    "Terima kasih.\nEducreator System";

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#101828">' +
    "<h2>Pengesahan Pendaftaran Bengkel</h2>" +
    "<p>Assalamualaikum dan salam sejahtera <strong>" +
    escapeHtml_(participant.fullName) +
    "</strong>,</p>" +
    "<p>Pendaftaran anda telah diterima.</p>" +
    '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #d0d5dd">' +
    row_("Tajuk", WORKSHOP.title) +
    row_("Tarikh", WORKSHOP.date) +
    row_("Masa", WORKSHOP.time) +
    row_("Platform", WORKSHOP.platform) +
    row_("Amaun Bayaran", WORKSHOP.fee) +
    row_("Nama Sekolah", participant.schoolName) +
    "</table>" +
    '<p><strong>Group Telegram:</strong><br><a href="' +
    TELEGRAM_LINK +
    '">' +
    TELEGRAM_LINK +
    "</a></p>" +
    "<p>Sila simpan emel ini sebagai rujukan. Jika emel ini berada dalam Spam, tandakan sebagai Not Spam.</p>" +
    "<p>Terima kasih.<br>Educreator System</p>" +
    "</div>";

  MailApp.sendEmail({
    to: participant.email,
    subject,
    body: plainBody,
    htmlBody,
    name: "Educreator System",
  });
}

function row_(label, value) {
  return (
    "<tr>" +
    '<td style="border:1px solid #d0d5dd;background:#f9fafb"><strong>' +
    escapeHtml_(label) +
    "</strong></td>" +
    '<td style="border:1px solid #d0d5dd">' +
    escapeHtml_(value) +
    "</td>" +
    "</tr>"
  );
}

function sanitizeFileName_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
