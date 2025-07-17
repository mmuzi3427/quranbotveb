const TELEGRAM_TOKEN = "TOKEN";
const SHEET_ID = "1XJTmtb3bmePZTMtt8jZSKL5stQXgbPbtDwVOpnZClQU";
const SHEET_USERS = "List2";
const SHEET_APPLICATIONS = "List1";
const SHEET_CHANNELS = "kanallar";

function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  const msg = contents.message;
  const chatId = msg?.chat?.id;
  const text = msg?.text;
  const userId = msg?.from?.id;
  const firstName = msg?.from?.first_name;
  const username = msg?.from?.username;

  const callback = contents.callback_query;
  const cData = callback?.data;
  const cId = callback?.message?.chat?.id;
  const callid = callback?.id;

  const chatMemberUpdate = contents.chat_member;
  const newMemberId = chatMemberUpdate?.user?.id;
  const newMemberName = chatMemberUpdate?.user?.first_name;
  const channelId = msg?.chat?.id;

  const jogChannelId = -1002659972280;
  const mainChannelId = -1002366968461;

  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const userSheet = sheet.getSheetByName(SHEET_USERS);
  const channelSheet = sheet.getSheetByName(SHEET_CHANNELS);

  // ✅ Text message handler
  if (text && isJoin(channelSheet, userId)) {
    if (text === "/start") {
      if (!isUserExist(userSheet, userId)) {
        userSheet.appendRow([userId, new Date(), username, firstName]);
      }
      bot("sendMessage", {
        chat_id: userId,
        text: `Assalomu Alaykum hurmatli ${firstName} kanal yordamchi botiga xush kelibsiz!\nBot versiyasi v1.0`,
        reply_markup: {
          keyboard: [["Kanal qoʻshish"], ["Post yuborish"]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } else if (text === "Kanal qoʻshish") {
      bot("sendMessage", {
        chat_id: userId,
        text: "Ushbu boʻlim hozirda ta'mirda..."
      });
    } else {
      bot("sendMessage", {
        chat_id: userId,
        text: "Assalomu Alaykum"
      });
    }
    return;
  }

  // ✅ Callback query handler
  if (callback) {
    if (isJoin(channelSheet, cId, false)) {
      bot("sendMessage", {
        chat_id: cId,
        text: cData
      });
    } else {
      bot("answerCallbackQuery", {
        callback_query_id: callid,
        text: "⚡ Barcha kanallarga obuna boʻlishingiz shart 🔔\nAks holda botimizda foydalana olmaysiz ❌",
        show_alert: true
      });
    }
    return;
  }

  // ✅ New member joined main channel
  if (chatMemberUpdate && channelId === mainChannelId) {
    const welcomeText = `Kanalimizga qoʻshildi: <a href="tg://user?id=${newMemberId}">${newMemberName}</a>`;
    bot("sendMessage", {
      chat_id: jogChannelId,
      text: welcomeText,
      parse_mode: "HTML"
    });
    return;
  }
}

function isUserExist(sheet, userId) {
  return sheet.getDataRange().getValues().some(row => row[0] == userId);
}

function isJoin(sheet, userId, can_send = true) {
  const channelList = sheet.getDataRange().getValues()[0] || [];
  let buttons = [];
  let unsubscribed = false;

  if (channelList.length === 0) return true;

  for (let url of channelList) {
    const chat = bot("getChat", { chat_id: "@" + url });
    const title = chat?.title || url;

    const member = bot("getChatMember", {
      chat_id: "@" + url,
      user_id: userId
    });
    const status = member?.status;

    buttons.push([
      {
        text: (status !== "left" ? "✅ " : "❌ ") + title,
        url: "https://t.me/" + url
      }
    ]);

    if (status === "left") unsubscribed = true;
  }

  buttons.push([{ text: "Tekshirish ✅", callback_data: "check" }]);

  if (unsubscribed && can_send) {
    bot("sendMessage", {
      chat_id: userId,
      text: `<b>⚠️ Botdan to'liq foydalanish uchun quyidagi kanallarimizga obuna bo'ling!</b>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons }
    });
  }

  return !unsubscribed;
}

// ✅ TELEGRAM API REQUEST FUNCTION
function bot(method, data) {
  try {
    const res = UrlFetchApp.fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`,
      {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(data)
      }
    );
    const json = JSON.parse(res.getContentText());
    return json.ok ? json.result : null;
  } catch (e) {
    Logger.log(`❌ Telegram API error: ${e.message}`);
    return null;
  }
}
