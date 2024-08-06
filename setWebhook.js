function setWebhook(){
  var url = tgBotUrl + "/setwebhook?url="+hookUrl;
  var res = UrlFetchApp.fetch(url).getContentText();
  Logger.log(res);
}