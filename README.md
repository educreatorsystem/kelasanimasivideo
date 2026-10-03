# Landing Page Bengkel Educreator

Fail utama:

- `index.html` - landing page pendaftaran
- `styles.css` - reka bentuk funky dan comel
- `script.js` - validasi form, upload resit sebagai Base64, popup status
- `apps-script/Code.gs` - kod Google Apps Script untuk simpan data, simpan resit dan hantar emel pengesahan

## Cara pasang Apps Script

1. Buka projek Apps Script yang menggunakan URL web app ini:
   `https://script.google.com/macros/s/AKfycbxJwYTscgqOA1xHgRgJPCfObzzPBqway6XQK_4vRRt-nUgGYqnM8eQe9L-2MDYKZsKu/exec`
2. Gantikan kandungan `Code.gs` dengan kod dalam `apps-script/Code.gs`.
3. Pastikan Google Sheet ID ialah:
   `1yLuIezCi-1cSbLGv5ugCLdvxO_xiNVBhRZ5cmifstAk`
4. Pastikan folder Drive untuk resit ialah:
   `1oKZ1DSG0lMdg2MJ9p93xZhFQz-ilPh6x`
5. Deploy sebagai Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Jika URL deployment berubah, kemas kini nilai `SCRIPT_URL` dalam `script.js`.

## Nota penting

Laman statik menghantar data ke Apps Script menggunakan `fetch` dengan `mode: "no-cors"` supaya penghantaran rentas domain lebih stabil. Oleh sebab itu, laman akan memaparkan popup selepas permintaan dihantar, manakala Apps Script mengurus simpanan data dan emel pengesahan di belakang tabir.
