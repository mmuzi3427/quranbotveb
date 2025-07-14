const TELEGRAM_TOKEN = "7649232976:AAGqc7Uqzi9Y1bvOl121Dt1Y11SE2Iv_9Aw";
const SHEET_ID = "1XJTmtb3bmePZTMtt8jZSKL5stQXgbPbtDwVOpnZClQU";
const SHEET_USERS = "List2";
const SHEET_APPLICATIONS = "List1";

function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  const userId = contents.message?.from?.id;
  const firstName = contents.message?.from?.first_name;
  const username = contents.message?.from?.username;
  const text = contents.message?.text;

  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const userSheet = sheet.getSheetByName(SHEET_USERS);
  const appSheet = sheet.getSheetByName(SHEET_APPLICATIONS);

  const lefrtMember = contents.message?.left_chat_member;
  const newMember = contents.message?.new_chat_member;
  const chatId = contents.message?.chat.id;
  const jogChannelId = -1002659972280;
  const mainChannelId = -1002366968461
  

  let lang = PropertiesService.getUserProperties().getProperty("lang_" + userId);

  if (text === "/start") {
    if (!isUserExist(userSheet, userId)) {
      userSheet.appendRow([userId, new Date(), username, firstName]);
    }

    sendMessage(userId, `Assalomu Alaykum hurmatli ${firstName} kanal yordamchi botiga xush kelibsiz!`, {
      keyboard: [["Kanal qoʻshish"], ["Post yuborish"]],
      one_time_keyboard: true,
      resize_keyboard: false
    });
    return;
  }
  if (text !== "/start"){
    bot("sendMessage", userId, "Assalomu Alaykum")
  }
  if (text === "Kanal qoʻshish"){
    sendMessage(userId, "Ushbu boʻlim hozirda ta'mirda...")
  } else {
    sendMessage(userId, text)
  }
  if (newMember && chatId === mainChannelId) {
    sendMessage(jogChannelId, `Kanalimizga qoʻshildi: <a href="tg://user?id=${userId}">${firstName}</a>`, {
      parse_mode: 'html'
    }
               );
  }
  if (newMember && chatId === mainChannelId) {
     bot("sendMessage", {
       chat_id: jogChannelId, 
       text: `Kanalimizga qoʻshildi: <a href="tg://user?id=${userId}">${firstName}</a>`, 
       parse_mode: 'html'
     }
        );
  }
}
// USER EXIST CHECK
function isUserExist(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  return data.some(row => row[0] == userId);
}


//bot 
function bot(method, data) {
      fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        if (res.ok) {
          return true;
        } else {
          return false;
        }
      })
      .catch(err => {
        return false;
      });
}
// SEND MESSAGE
function sendMessage(chatId, text, options = {}) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: options.parse_mode || "HTML"
  };

  if (options.keyboard) {
    payload.reply_markup = JSON.stringify({
      keyboard: options.keyboard.keyboard || options.keyboard,
      resize_keyboard: true
    });
  }

  UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}
