function sendMessage(payload){
  let options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  }
  return UrlFetchApp.fetch(tgBotUrl + "/sendMessage", options);
}