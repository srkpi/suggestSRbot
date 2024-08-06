const token = ''; // token
const tgBotUrl = 'https://api.telegram.org/bot' + token;
const hookUrl = ''; // script
const supChat = '';

const scriptProperties = PropertiesService.getScriptProperties();
const BAN_SHEET_ID = '';
const BAN_SHEET_NAME = 'BanList';
const message = `Задавайте питання та пропонуйте свої новини.\n\n` +
`Просто пришліть текст або додаток. Будь ласка, якщо це можливо, оформляйте картинку та описання одним постом.\nДякуємо😊`;

var userIdSup = "";

const command  = {
  "/start": message,
  "/ban": handleBanCommand,
  "/perban": handleBanCommand,
  "/unban": handleUnbanCommand,
  "/banlist": handleBanlistCommand,
}

function doPost(e) {
  const webhookData = JSON.parse(e.postData.contents);
  if (webhookData.callback_query) {
    const callbackData = webhookData.callback_query.data;
    const chatId = webhookData.callback_query.message.chat.id;
    userIdSup = webhookData.callback_query.from.id; // Set userIdSup to the ID of the user who clicked the button
    handleCallbackQuery(callbackData, chatId);
    return;
  }

  
  const from = webhookData.message.chat.id;
  const text = webhookData.message.text;
  userIdSup = webhookData.message.from.id;

  if (from == supChat && (webhookData.message && webhookData.message.reply_to_message)) {
    const userId = scriptProperties.getProperty(webhookData.message.reply_to_message.message_id.toString());
    const sendText = webhookData.message.text ? encodeURIComponent(webhookData.message.text) : undefined;
    let url;

    if(webhookData.message.sticker) {
      url = tgBotUrl + "/sendSticker?chat_id=" + userId + "&sticker=" + webhookData.message.sticker.file_id;
    } else if(webhookData.message.animation) {
      url = tgBotUrl + "/sendAnimation?chat_id=" + userId + "&animation=" + webhookData.message.animation.file_id;
    } else if(webhookData.message.video){
      const caption = webhookData.message.caption ? encodeURIComponent(webhookData.message.caption) : '';
      url = tgBotUrl + "/sendVideo?chat_id=" + userId + "&video=" + webhookData.message.video.file_id + "&caption=" + caption;
    } else if(webhookData.message.document){
      url = tgBotUrl + "/sendDocument?chat_id=" + userId + "&document=" + webhookData.message.document.file_id;
    } else if(webhookData.message.photo){
      const caption = webhookData.message.caption ? encodeURIComponent(webhookData.message.caption) : '';
      url = tgBotUrl + "/sendPhoto?chat_id=" + userId + "&photo=" + webhookData.message.photo[webhookData.message.photo.length - 1].file_id + "&caption=" + caption;
      UrlFetchApp.fetch(url, {"muteHttpExceptions": true}).getContentText(); // Send photo
      return; // Skip the rest of the function
      
    } else if(sendText) {
      url = tgBotUrl + "/copyMessage?chat_id=" + userId + "&from_chat_id=" + supChat + "&message_id=" + webhookData.message.message_id;
    }

    const result = UrlFetchApp.fetch(url, {"muteHttpExceptions": true}).getContentText();
    scriptProperties.setProperty(webhookData.message.message_id.toString(), JSON.parse(result).result.message_id);
  } else if (from == supChat && webhookData.message){
      const commandText = text.split(" ")[0];
      if (command.hasOwnProperty(commandText)) {
        const result = typeof command[commandText] === 'function' ? command[commandText](from, text) : command[commandText];
        const sendText = encodeURIComponent(result);
        const url  = tgBotUrl + "/sendMessage?parse_mode=HTML&chat_id=" + from + "&text=" + sendText;
        const opts = {"muteHttpExceptions": true};
        UrlFetchApp.fetch(url, opts).getContentText();
      }
    } else if (from != supChat && webhookData.message) {
      if (command.hasOwnProperty(text)) {
        const result = typeof command[text] === 'function' ? command[text]() : command[text];
        const sendText = encodeURIComponent(result);
        const url  = tgBotUrl + "/sendMessage?parse_mode=HTML&chat_id=" + from + "&text=" + sendText;
        const opts = {"muteHttpExceptions": true};

        UrlFetchApp.fetch(url, opts).getContentText();
      } else {
        const { animation, document, from: userFrom } = webhookData.message;
        if (!(animation || document)){
          const sentBy = userFrom.username ? `@${userFrom.username}` : userFrom.first_name;
          const [isBanned, response] = isUserBanned(sentBy);
          if (isBanned) {
            const url = tgBotUrl + "/sendMessage?chat_id=" + from + "&text=" + encodeURIComponent(response);
            UrlFetchApp.fetch(url);
            return;
          }
          const ticket = `Запит #T${from} від ${sentBy}`;
          payload = {
            'chat_id': supChat,
            'text': ticket,
            'reply_markup': createBanKeyboard(userFrom.id, sentBy)
          }
          sendMessage(payload);
      }
      const url = tgBotUrl + "/forwardMessage?chat_id=" + supChat + "&from_chat_id=" + from + "&message_id=" + webhookData.message.message_id;
      const result = UrlFetchApp.fetch(url, {"muteHttpExceptions": true}).getContentText();
      scriptProperties.setProperty(JSON.parse(result).result.message_id.toString(), from.toString());
    }
  }
  // No else clause for edited messages from non-support chat, so they won't be forwarded again
}

function handleCallbackQuery(callbackData, chatId) {
  const commandText = callbackData.split(" ")[0];

  if (command.hasOwnProperty(commandText)) {
    const result = typeof command[commandText] === 'function' ? command[commandText](chatId, callbackData) : command[commandText];
    const sendText = encodeURIComponent(result);
    const url  = tgBotUrl + "/sendMessage?parse_mode=HTML&chat_id=" + chatId + "&text=" + sendText;
    const opts = {"muteHttpExceptions": true};
    UrlFetchApp.fetch(url, opts).getContentText();
  }
}

function doGet(e){
  return ContentService.createTextOutput("Method GET not allowed");
}
