const SHEET_ID = "15KxMuvLrbhTM70DoGcKtf1CqHSKbFSQNBUzcr29OZvY";
const SHEET_NAME = "Sheet1"; // o'zgartiring agar boshqa nomda bo‘lsa

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const { action, code, title, url } = data;

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  if (action === "get") {
    const rows = sheet.getDataRange().getValues();
    const found = rows.find(row => row[0] == code);
    if (found) {
      return ContentService.createTextOutput(JSON.stringify({
        found: true,
        title: found[1],
        url: found[2]
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ found: false }));
    }
  }

  if (action === "add") {
    sheet.appendRow([code, title, url, new Date()]);
    return ContentService.createTextOutput("OK");
  }

  if (action === "delete") {
    const rows = sheet.getDataRange().getValues();
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == code) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput("Deleted");
      }
    }
    return ContentService.createTextOutput("Not Found");
  }

  return ContentService.createTextOutput("Invalid Action");
}



const http = require('http');
const https = require('https');
const TOKEN = "7649232976:AAGqc7Uqzi9Y1bvOl121Dt1Y11SE2Iv_9Aw";
const SHEET_URL = "YOUR_WEB_APP_URL"; // Google Script URL
const ADMIN_ID = 8028076014; // faqat sizning Telegram ID

function sendMessage(chat_id, text) {
  const data = JSON.stringify({
    chat_id,
    text,
    reply_markup: {
      keyboard: [["🎬 Kino qo‘shish", "❌ Kino o‘chirish"]],
      resize_keyboard: true
    }
  });

  const req = https.request({
    hostname: "api.telegram.org",
    path: `/bot${TOKEN}/sendMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  }, res => res.on("data", () => {}));
  req.write(data);
  req.end();
}

function sendVideo(chat_id, videoUrl, caption = "") {
  const data = JSON.stringify({
    chat_id,
    video: videoUrl,
    caption
  });

  const req = https.request({
    hostname: "api.telegram.org",
    path: /bot${TOKEN}/sendVideo,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  }, res => res.on("data", () => {}));
  req.write(data);
  req.end();
}

function handleUpdate(update) {
  const msg = update.message;
  const text = msg.text;
  const chat_id = msg.chat.id;

  if (text === "/start") {
    sendMessage(chat_id, "🎬 Kodli Kino Botga xush kelibsiz!\nKino kodini yuboring.");
    return;
  }

  if (chat_id === ADMIN_ID && text === "🎬 Kino qo‘shish") {
    sendMessage(chat_id, "Yangi kinoni shu formatda yuboring:\n\nadd|KOD|Nomi|VideoURL");
    return;
  }

  if (chat_id === ADMIN_ID && text === "❌ Kino o‘chirish") {
    sendMessage(chat_id, "O‘chirish uchun kodni shu formatda yuboring:\n\ndelete|KOD");
    return;
  }

  if (chat_id === ADMIN_ID && text.startsWith("add|")) {
    const [, code, title, url] = text.split("|");
    const payload = JSON.stringify({ action: "add", code, title, url });

    fetchSheet(payload, () => {
      sendMessage(chat_id, "✅ Kino qo‘shildi.");
    });
    return;
  }

  if (chat_id === ADMIN_ID && text.startsWith("delete|")) {
    const [, code] = text.split("|");
    const payload = JSON.stringify({ action: "delete", code });

    fetchSheet(payload, (res) => {
      sendMessage(chat_id, res === "Deleted" ? "🗑 O‘chirildi." : "❌ Topilmadi.");
    });
    return;
  }

  // User sends code
  const code = text.trim();
  const payload = JSON.stringify({ action: "get", code });

  fetchSheet(payload, (res) => {
    const json = JSON.parse(res);
    if (json.found) {
      sendVideo(chat_id, json.url, json.title);
    } else {
      sendMessage(chat_id, "❌ Bunday kod topilmadi.");
    }
  });
}

// Google Script bilan aloqa
function fetchSheet(payload, callback) {
  const options = new URL(SHEET_URL);
  const req = https.request({
    hostname: options.hostname,
    path: options.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  }, res => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => callback(data));
  });
  req.write(payload);
  req.end();
}

// Telegram Webhook server
http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const update = JSON.parse(body);
      handleUpdate(update);
      res.end("OK");
    });
  } else {
    res.end("Telegram bot");
  }
}).listen(3000, () => {
  console.log("Bot server 3000-portda ishga tushdi");
});
