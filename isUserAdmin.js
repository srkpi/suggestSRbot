function isUserAdmin(chatId, userId) {
  const url = tgBotUrl + "/getChatAdministrators?chat_id=" + chatId;
  const response = UrlFetchApp.fetch(url).getContentText();
  const admins = JSON.parse(response).result;
  
  for (let i = 0; i < admins.length; i++) {
    if (admins[i].user.id.toString() == userId.toString()) {
      return true;
    }
  }
  return false;
}