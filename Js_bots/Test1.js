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
    // Start komandasi
    if (isJoin(channels, chatId) === true) {
        if (text === "/start") {
            if (!isUserExist(userSheet, userId)) {
                userSheet.appendRow([userId, new Date(), username, firstName]);
            }

            sendMessage(userId, `Assalomu Alaykum hurmatli ${firstName} kanal yordamchi botiga xush kelibsiz!\nBot versiyasi v1.0`, {
                keyboard: [["Kanal qoʻshish"], ["Post yuborish"]],
                one_time_keyboard: true,
                resize_keyboard: false
            });
            return;
        }

        // "Kanal qoʻshish" tugmasi
        if (text === "Kanal qoʻshish") {
            sendMessage(userId, "Ushbu boʻlim hozirda ta'mirda...");
            return;
        }

        // Boshqa matnlar
        if (text) {
            bot("sendMessage", {
                chat_id: userId,
                text: "Assalomu Alaykum"
            });
            return;
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
}

// USER EXIST CHECK
function isUserExist(sheet, userId) {
    const data = sheet.getDataRange().getValues();
    return data.some(row => row[0] == userId);
}
function isJoin(sheet, id) {
    const channels = Array(sheet.getDataRange().getValues()[0]); //["channnel1","channel2","channel3"]
    let buttons = [];
    let uns = false;
    if (channels.length === 0 || channels === null){
        return true;
    } else {
        for (let i = 0; i < channels.length; i++){
            let url = channels[i];
            let nom = bot("getChat", {chat_id: `@${url}`}, "get");
            bot("sendMessage", {
                chat_id: id,
                text: String(nom?.title)
            });
            let nomObj = bot("getChat", { chat_id: "@" + url });
            bot("sendMessage", {
                chat_id: id,
                text: JSON.stringify(nomObj, null, 2)
            });
            
            let ism = nom?.result?.title;
            let ret = JSON.parse(bot("getChatMember", {
                chat_id: "@"+url,
                user_id: id,
            }));
            let status = ret?.result?.status;
            if (status !== "left"){
                buttons.push([
                    {
                        text: "✅ " + ism,
                        url: "https://t.me/" + url
                    }
                ])
            } else {
                buttons.push([
                    {
                        text: "❌ " + ism,
                        url: "https://t.me/" + url
                    }
                ])
                uns = true;
            }
        }
        buttons.push([
            {
                text: "Tekshirish ✅",
                callback_data: "check"
            }
        ])
    }
    let arr = {inline_keyboard: buttons};
    if (uns === true){
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
function bot(method, data, type="post") {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
        method: type,
        contentType: "application/json",
        payload: JSON.stringify(data)
    });
}

// Xabar yuborish
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
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
    });
}
