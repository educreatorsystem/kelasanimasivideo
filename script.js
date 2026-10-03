const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxJwYTscgqOA1xHgRgJPCfObzzPBqway6XQK_4vRRt-nUgGYqnM8eQe9L-2MDYKZsKu/exec";

const TELEGRAM_LINK = "https://t.me/+bR0TCJJoEgNkYmQ1";
const WORKSHOP_TITLE = "From Text Book to Animation Video";
const WORKSHOP_DATE = "11 Oktober 2026 (Ahad)";
const WORKSHOP_TIME = "3.00 PM - 4.30 PM";
const WORKSHOP_PLATFORM = "Google Meet";
const WORKSHOP_FEE = "RM 40";

const form = document.querySelector("#registrationForm");
const submitButton = document.querySelector("#submitButton");
const successDialog = document.querySelector("#successDialog");
const closeDialog = document.querySelector("#closeDialog");
const copyAccount = document.querySelector("#copyAccount");
const fullNameInput = document.querySelector("#fullName");

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function showSuccessDialog() {
  if (typeof successDialog.showModal === "function") {
    successDialog.showModal();
  } else {
    alert(
      "Pendaftaran berjaya dihantar. Sila semak emel pengesahan dalam Inbox dan Spam."
    );
  }
}

fullNameInput.addEventListener("input", () => {
  fullNameInput.value = fullNameInput.value.toUpperCase();
});

copyAccount.addEventListener("click", async () => {
  const accountNumber = copyAccount.textContent.trim();
  try {
    await navigator.clipboard.writeText(accountNumber);
    copyAccount.textContent = "Disalin: " + accountNumber;
    setTimeout(() => {
      copyAccount.textContent = accountNumber;
    }, 1600);
  } catch {
    copyAccount.textContent = accountNumber;
  }
});

closeDialog.addEventListener("click", () => {
  successDialog.close();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const receipt = document.querySelector("#receipt").files[0];
  if (!receipt) {
    alert("Sila muat naik resit bayaran.");
    return;
  }

  const maxSize = 8 * 1024 * 1024;
  if (receipt.size > maxSize) {
    alert("Saiz resit terlalu besar. Sila muat naik fail bawah 8MB.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sedang dihantar...";

  try {
    const receiptDataUrl = await fileToDataUrl(receipt);
    const payload = new URLSearchParams({
      fullName: document.querySelector("#fullName").value.trim().toUpperCase(),
      schoolName: document.querySelector("#schoolName").value.trim(),
      email: document.querySelector("#email").value.trim(),
      receiptName: receipt.name,
      receiptMime: receipt.type || "application/octet-stream",
      receiptData: receiptDataUrl,
      workshopTitle: WORKSHOP_TITLE,
      workshopDate: WORKSHOP_DATE,
      workshopTime: WORKSHOP_TIME,
      workshopPlatform: WORKSHOP_PLATFORM,
      workshopFee: WORKSHOP_FEE,
      telegramLink: TELEGRAM_LINK,
      sourcePage: window.location.href,
    });

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: payload,
    });

    form.reset();
    showSuccessDialog();
  } catch (error) {
    alert(
      "Maaf, pendaftaran tidak dapat dihantar. Sila cuba lagi atau hubungi pihak penganjur."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Hantar Pendaftaran";
  }
});
