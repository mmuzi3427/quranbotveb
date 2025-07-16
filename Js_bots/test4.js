const TELEGRAM_TOKEN = "7649232976:AAGqc7Uqzi9Y1bvOl121Dt1Y11SE2Iv_9Aw";
const SHEET_ID = "1XJTmtb3bmePZTMtt8jZSKL5stQXgbPbtDwVOpnZClQU";
const SHEET_USERS = "List2";
const SHEET_APPLICATIONS = "List1";
const SHEET_CHANNELS = "kanallar";

function doPost(e) {
    const contents = JSON.parse(e.postData.contents);
    const userId = contents.message?.from?.id;
    const firstName = contents.message?.from?.first_name;
    const username = contents.message?.from?.username;
    const text = contents.message?.text;
    //kanalga qoʻshilgan yoki chiqqandagi ma'lumotlar
    const newMembersList = contents.chat_member;
    const memberId = newMembersList?.user?.id;
    const memberName = newMembersList?.user?.first_name;
  
    const chatId = contents.message?.chat?.id;

    const jogChannelId = -1002659972280;
    const mainChannelId = -1002366968461;

    const sheet = SpreadsheetApp.openById(SHEET_ID);
    const userSheet = sheet.getSheetByName(SHEET_USERS);
    const channels = sheet.getSheetByName(SHEET_CHANNELS);
    //coolback
    const call = contents.callback_query;
    const cData = call?.data,
    const cId = call?.message?.chat?.id,
    // Boshqa matnlar
    if (text && isJoin(channels, chatId) === true) {
        if (text === "/start") {
            if (!isUserExist(userSheet, userId)) {
                userSheet.appendRow([userId, new Date(), username, firstName]);
            }
            bot("sendMessage", {
                chat_id: userId,
                text: `Assalomu Alaykum hurmatli ${firstName} kanal yordamchi botiga xush kelibsiz!\nBot versiyasi v1.0`,
                reply_markup: {
                    keyboard: [
                        ["Kanal qoʻshish"],
                        ["Post yuborish"]
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: false
                }
            });
            return;
        } else if (text === "Kanal qoʻshish") {
            bot("sendMessage", {
                chat_id: userId, 
                text: "Ushbu boʻlim hozirda ta'mirda..."
            });
            return;
        }
        bot("sendMessage", {
            chat_id: userId,
            text: "Assalomu Alaykum"
        });
        return;
    }
    if (call){
        if (isJoin(channels, chatId) === true){
            bot("", {
                chat_id: cId,
                text: cData
            })
        }
    }

    // Yangi a’zo kanalga qo‘shilganda
    if (newMembersList && chatId === mainChannelId) {
        const welcomeText = `Kanalimizga qoʻshildi: <a href="tg://user?id=${memberId}">${memberName}</a>`;
        bot("sendMessage", {
            chat_id: jogChannelId,
            text: welcomeText,
            parse_mode: 'HTML'
        });
        return;
    }
}

// USER EXIST CHECK
function isUserExist(sheet, userId) {
    const data = sheet.getDataRange().getValues();
    return data.some(row => row[0] == userId);
}
function isJoin(sheet, id) {
    const channels = sheet.getDataRange().getValues()[0]; // ✅ to‘g‘ri massiv
    let buttons = [];
    let uns = false;

    if (!channels || channels.length === 0) {
        return true;
    }

    for (let i = 0; i < channels.length; i++) {
        let url = channels[i];
        let nom = bot("getChat", { chat_id: "@" + url });
        let ism = nom?.title || url;

        let ret = bot("getChatMember", {
            chat_id: "@" + url,
            user_id: id,
        });

        let status = ret?.status;
        if (status !== "left") {
            buttons.push([
                {
                    text: "✅ " + ism,
                    url: "https://t.me/" + url
                }
            ]);
        } else {
            buttons.push([
                {
                    text: "❌ " + ism,
                    url: "https://t.me/" + url
                }
            ]);
            uns = true;
        }
    }

    buttons.push([
        {
            text: "Tekshirish ✅",
            callback_data: "check"
        }
    ]);

    const arr = { inline_keyboard: buttons };

    if (uns === true) {
        bot("sendMessage", {
            chat_id: id,
            text: `<b>⚠️ Botdan to'liq foydalanish uchun quyidagi kanallarimizga obuna bo'ling!</b>`,
            parse_mode: 'html',
            reply_markup: arr
        });
        return false;
    } else {
        return true;
    }
}


// Telegram APIga so‘rov
function bot(method, data) {
  const res = UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });

  const json = JSON.parse(res.getContentText());

  // Natijani qaytarish
  if (json.ok) return json.result;
  else {
    // Hatolik bo‘lsa, konsolga chiqarish (Logs)
    Logger.log(json);
    return null;
  }
}
