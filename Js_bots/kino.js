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

  if (langMap[text]) {
    lang = langMap[text];
    PropertiesService.getUserProperties().setProperty("lang_" + userId, lang);
    const welcome = {
      uz: `Assalomu alaykum, ${firstName}. Botga xush kelibsiz!`,
      ru: `Здравствуйте, ${firstName}. Добро пожаловать!`,
      en: `Hello, ${firstName}. Welcome to the bot!`
    }[lang];

    const menu = {
      uz: [["Biz haqimizda", "Bo‘sh ish o‘rinlari"], ["Til"]],
      ru: [["О нас", "Вакансии"], ["Язык"]],
      en: [["About us", "Vacancies"], ["Language"]]
    }[lang];

    sendMessage(userId, welcome, {
      keyboard: menu,
      resize_keyboard: true
    });
    return;
  }
  if (text !== "/start"){
    if (text === "Kanal qoʻshish"){
      sendMessage(userId, "Ushbu boʻlim hozirda ta'mirda...")
    } else {
      sendMessage(userId, text)
    }
  }
  if (newMember && chatId === mainChannelId) {
    sendMessage(jogChannelId, `Kanalimizga qoʻshildi: <a href="tg://user?id=${userId}">${firstName}</a>`, parse_mode = 'html', );
  }
  if (newMember && chatId === mainChannelId) {
     bot("sendMessage", jogChannelId, `Kanalimizga qoʻshildi: <a href="tg://user?id=${userId}">${firstName}</a>`, parse_mode = 'html', );
  }
  if (!lang) return;

  const dictionary = {
    about: { uz: "Biz ... haqida ma'lumot", ru: "Мы ... информация", en: "We are ... info" },
    jobs: ["Menejer", "Ofitsiant", "Oshpaz", "Qadoqlovchi"],
    jobInfo: {
      "Menejer": "Menejer — bu boshqaruv bo‘yicha mas’ul...",
      "Ofitsiant": "Ofitsiant — mijozlarga xizmat qiladi...",
      "Oshpaz": "Oshpaz — taomlar tayyorlaydi...",
      "Qadoqlovchi": "Qadoqlovchi — mahsulotlarni qadoqlaydi..."
    },
    questions: {
      uz: ["Ismingiz?", "Yoshingiz?", "Qayerdansiz?", "Telefon raqamingiz?", "Biz bilan ishlashga tayyormisiz?"],
      ru: ["Ваше имя?", "Ваш возраст?", "Откуда вы?", "Ваш номер?", "Вы готовы работать с нами?"],
      en: ["Your name?", "Your age?", "Where are you from?", "Your phone number?", "Are you ready to work with us?"]
    },
    thanks: {
      uz: "Rahmat! Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.",
      ru: "Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.",
      en: "Thank you! Your application has been received. We will contact you soon."
    }
  };

  // About Us
  if (["Biz haqimizda", "О нас", "About us"].includes(text)) {
    sendMessage(userId, dictionary.about[lang]);
    return;
  }

  // Job list
  if (["Bo‘sh ish o‘rinlari", "Вакансии", "Vacancies"].includes(text)) {
    sendMessage(userId, {
      uz: "Quyidagi kasblarni tanlang:",
      ru: "Выберите профессию:",
      en: "Choose a position:"
    }[lang], {
      keyboard: [dictionary.jobs],
      one_time_keyboard: true,
      resize_keyboard: true
    });
    return;
  }

  // Job info
  if (dictionary.jobs.includes(text)) {
    PropertiesService.getUserProperties().setProperty("job_" + userId, text);
    PropertiesService.getUserProperties().setProperty("step_" + userId, 0);
    sendMessage(userId, dictionary.jobInfo[text]);
    sendMessage(userId, dictionary.questions[lang][0]);
    return;
  }

  // Collect Answers
  const step = parseInt(PropertiesService.getUserProperties().getProperty("step_" + userId));

if (!isNaN(step)) {
    const job = PropertiesService.getUserProperties().getProperty("job_" + userId);
    const key = "answers_" + userId;
    const answers = JSON.parse(PropertiesService.getUserProperties().getProperty(key) || "[]");
    answers[step] = text;
    PropertiesService.getUserProperties().setProperty(key, JSON.stringify(answers));

    if (step < 4) {
      PropertiesService.getUserProperties().setProperty("step_" + userId, step + 1);
      sendMessage(userId, dictionary.questions[lang][step + 1]);
    } else {
      PropertiesService.getUserProperties().deleteProperty("step_" + userId);
      PropertiesService.getUserProperties().deleteProperty(key);

      appSheet.appendRow([new Date(), userId, job, ...answers]);
      sendMessage(userId, dictionary.thanks[lang]);
    }
    return;
  }
}

// USER EXIST CHECK
function isUserExist(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  return data.some(row => row[0] == userId);
}


//bot 
function bot(method, data) {
      fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
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
function sendMessage(chatId, text, keyboard = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    ...(keyboard && {
      reply_markup: JSON.stringify({ 
        keyboard: keyboard.keyboard || keyboard,
        resize_keyboard: true 
      }) 
    })
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}
