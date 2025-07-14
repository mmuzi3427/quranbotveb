const TELEGRAM_TOKEN = "7649232976:AAGqc7Uqzi9Y1bvOl121Dt1Y11SE2Iv_9Aw";
const SHEET_ID = "1PgGrglPfcaFSGjnqan6rUmfN8VFmJMasZ_x93M57poY";
const SHEET_NAME = "Members";

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const message = data.message;

  if (!message) return;

  const chatId = message.chat.id;

  const newMember = message.new_chat_member;
  if (newMember) {
    const userId = newMember.id;
    const firstName = newMember.first_name || "";
    const username = newMember.username || "";

    // Google Sheets'ga yozish
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!isUserExist(sheet, userId)) {
      sheet.appendRow([userId, firstName, username, new Date()]);
    }

    // Salomlashuv xabari
    const welcomeText = `👋 Assalomu alaykum <a href="tg://user?id=${userId}">${firstName}</a>!\nKanalimizga xush kelibsiz! 😊`;

    sendMessage(chatId, welcomeText, "HTML");
  }
}

// Yangi aʼzoni tekshirish
function isUserExist(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  return data.some(row => row[0] == userId);
}

// Xabar yuborish
function sendMessage(chatId, text, parseMode = "HTML") {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode
  };

  UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}
