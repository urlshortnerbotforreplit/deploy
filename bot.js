require('dotenv').config({
    path: './.env'
});
const TelegramBot = require('node-telegram-bot-api'); //Telegram bot api
const express = require('express'); //For web app to keep the bot alive
const axios = require('axios'); //For making http requests
const res = require('express/lib/response');
const app = express();

app.get("/", (request, response) => {
    response.send("Bot is running!!! āļø");
});

const token = process.env.BOT_TOKEN; //Telegram bot token
const api = process.env.TINYURL_API; //TinyURL API

const bot = new TelegramBot(token, {
    polling: true
});


//Setting bot commands
bot.setMyCommands([{
        command: '/start',
        description: 'Check if I am alive š¤'
    }],
    [{
        command: '/help',
        description: 'Get help!!! šµāš«'
    }]
);


bot.on('message', (msg) => {

    // Main Shotener Code
    if (msg.text.toString().toLowerCase().includes('https') || msg.text.toString().includes('http')) {

        var reqURL = msg.text.toString();
        var splitURL = reqURL.split(' ');
        var url = splitURL[0];
        var alias = splitURL[1];

        var chilpURL = `http://chilp.it/api.php?url=${url}`; //Without Custom Alias
        var clckruURL = `https://clck.ru/--?url=${url}`;

        var tinyURL = `https://api.tinyurl.com/create?api_token=${api}&url=${url}&domain=tiny.one`; //With Custom Alias
        var dagdURL = `https://da.gd/s?url=${url}`;
        var isgdURL = `https://is.gd/create.php?format=json&url=${url}`;

        if (alias != undefined) {
            tinyURL += `&alias=${alias}`;
            dagdURL += `&shorturl=${alias}`;
            isgdURL += `&shorturl=${alias}`;
        }
        var urls = [chilpURL, clckruURL, tinyURL, dagdURL, isgdURL];

        axios.all(urls.map((url) => axios.get(url)))
            .then(async (res) => {

                var urlResponse = "ā *URL shortend Successfully!*\n\nš  *URL: * " + url +
                    "\n\nš° *Shortend URLs:* \n\n" +
                    "š  *TinyURL:* " + "`" + res[2].data.data.tiny_url + "`\n" +
                    "š  *Isgd:* " + "`" + res[4].data.shorturl + "`\n" +
                    "š  *Dagd:* " + "`" + res[3].data.toString().replace('\n', '') + "`\n" +
                    "š  *Chilp:* " + "`" + res[0].data + "`" +
                    "š  *Clckru:* " + "`" + res[1].data + "`";
                await bot.sendChatAction(msg.chat.id, 'typing');
                bot.sendMessage(msg.chat.id, urlResponse, {
                    parse_mode: 'Markdown'
                });
            })
            .catch(async err => {
                var errorResponse = "ā *URL shortend Failed!*\n\nš *URL:* " + url + "\nš *Error:* Invalid URL/Alias!\nš Get help by typing /help";

                await bot.sendChatAction(msg.chat.id, 'typing');
                bot.sendMessage(msg.chat.id, errorResponse);
                console.log(err);
            })
    }

    // Start Message
    if (msg.text.toString().includes('/start')) {
        bot.sendMessage(msg.chat.id, "Hey burh! I am alive! šš»\n\nGive me a link to shorten and I will do the rest! š¤\n\nType /help for more info!");
    }

    // Help Message
    if (msg.text.toString().includes('/help')) {
        var help = `Check if I am alive by typing /start\nGive me a valid URL to shorten and I will do the rest!\n\n*Example:*\n https://www.google.com\n\n*Example with Custom Alias:*\n https://www.google.com google\n\nā ļø *Note :*\n1ļøā£ *Custom Alias* is optional.\n2ļøā£ Only *TinyURL, Isgd, Dagd* supports *Custom Alias*.\n3ļøā£ *Dagd* supports 10 character *Custom Alias*.\n4ļøā£ On *error* try to change the *Custom Alias*.`;
        bot.sendMessage(msg.chat.id, help, {
            parse_mode: 'Markdown'
        });
    }
})

app.listen(80)
