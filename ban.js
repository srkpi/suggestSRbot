const banType = {
  "/ban": "default",
  "/perban": "permanent",
};

const rephrase = {
  "default": "У вас є право на апеляцію. Напишіть в особисті @hoshion або @merk4info.",
  "permanent": "У вас немає права на апеляцію.",
};

function handleBanCommand(chatId, text) {
  const userId = text.split(" ")[1]; // User ID from callback data
  const userName = text.split(" ")[2]; // Username from callback data
  const sheet = SpreadsheetApp.openById(BAN_SHEET_ID).getSheetByName(BAN_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][2] == userId) {
      return 'Користувач вже заблокований';
    }
  }
  
  if (!isUserAdmin(supChat, userIdSup)) {
    return "Команда доступна тільки адміністраторам групи.";
  }
  const type = banType[text.split(" ")[0]];


  
  sheet.appendRow([userName, type, userId, new Date()]);
  return type === banType["/perban"] ? `⛓Користувач ${userName} заблокований назавжди.` : `🚫Користувач ${userName} заблокований.`;
}

function handleUnbanCommand(chatId, text) {
  if (!isUserAdmin(supChat, userIdSup)) {
    return "Команда доступна тільки адміністраторам групи.";
  }
  const username = text.split(" ")[1];

  const sheet = SpreadsheetApp.openById(BAN_SHEET_ID).getSheetByName(BAN_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === username) {
      if (data[i][1] === banType["/perban"]) {
        return `Користувач ${username} не може бути розблокований.`;
      }
      sheet.deleteRow(i + 1); 
      return `🔙 Користувач ${username} розблокований.`;
    }
  }

  return `Користувача ${username} не знайдено.`;
}

function handleBanlistCommand(chatId, text) {
  const sheet = SpreadsheetApp.openById(BAN_SHEET_ID).getSheetByName(BAN_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 1 && data[0][0] === "") {
    return "Нікого не заблоковано.";
  }
  
  let message = "Заблоковані користувачі:\n\n";
  for (let i = 0; i < data.length; i++) {
    message += `${i+1}. ${data[i][0]}\n`;
  }
  
  return message;
}

function isUserBanned(username) {
  const sheet = SpreadsheetApp.openById(BAN_SHEET_ID).getSheetByName(BAN_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === username) {
      return [true, `🚫 Ви заблоковані в боті. Ваше повідомлення не буде надіслано.\n${rephrase[data[i][1]]}`];
    }
  }
  
  return [false, ""];
}

