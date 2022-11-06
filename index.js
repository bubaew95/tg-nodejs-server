const TelegramBot = require('node-telegram-bot-api');

const token     = '5353840878:AAHPBxLX-TiYeZZQmnk2v8kEG4eA-ST4JpM';
const bot       = new TelegramBot(token, {polling: true});
const siteUrl   = 'https://fantastic-biscotti-957864.netlify.app/';

bot.setMyCommands([
    {
        command: '/phones',
        description: 'Список телефонов'
    }
])

// const {addUser} = require('./src/FireBase');
const {phones}  = require('./src/Base');

// bot.onText(/\/start/, async(msg, match) => {
//     const {from} = msg;
//     await addUser(from);
// });

bot.onText(/\iPhone (\d+)/, async (msg, match) => {

    const chatId        = msg.chat.id;
    const id            = match[1];
    const iPhones       = phones.filter(item => item.text === `iPhone ${id}`)[0] 
    const iPhoneItems   = iPhones.items.filter(item => item.text === msg.text)[0];
  
    if(iPhoneItems !== undefined) { 
        const inlineButtons = iPhoneItems.memories.reduce((resultArray, item, index) => { 
            const chunkIndex = Math.floor(index / 2)
        
            if(!resultArray[chunkIndex]) {
              resultArray[chunkIndex] = [] // start a new chunk
            }

            resultArray[chunkIndex].push({
                text: item.memory,
                callback_data: JSON.stringify(item)
            })
            return resultArray
        }, [])

        return await bot.sendMessage(chatId, msg.text, {
            reply_markup: {
                inline_keyboard: inlineButtons
            }
        });
    }

    let _phones = iPhones.items.map(item => {
        return [{
            text: item.text
        }];  
    });

    _phones.push([{text: '/телефоны'}])

    return bot.sendMessage(chatId, msg.text, {
        reply_markup: {
            keyboard: _phones
        }
    }); 
});

bot.on('polling_error', error => console.log(error))

bot.on("callback_query", async (msg) => {
    console.log(msg) 
    const { text, chat: { id } }  = msg.message;
    const data      = JSON.parse(msg.data);

    return  bot.sendMessage(
        id, 
        `${text}\nПамять: ${data.memory}\nЦена: ${data.price}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'Купить наличкой', callback_data: "buy_cashe"}, 
                        {text: 'Купить в рассрочку', callback_data: "buy_by_installment"}
                    ]
                ]
            }
        }
    )
    // bot.answerCallbackQuery(chatId, {text: 'test', show_alert: true}); 
});

bot.onText(/\/телефоны/, async (msg, match) => {
    const chatId = msg.chat.id;
    
    let keyboardButtons = phones.map(item => {
        return [{
            text: item.text
        }];
    });

    keyboardButtons.push([{text: 'Запустить приложение', web_app: {url: `${siteUrl}?id=${msg.from.id}`}}])

    return await bot.sendMessage(chatId, "Телефоны", {
        reply_markup: {
            keyboard: keyboardButtons,
            resize_keyboard: true
        }
    });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const {from} = msg;
 
    let message = "Добро пожаловать на наш Бот";
    if(typeof msg.web_app_data !== "undefined") {
        return web_app_data(msg);
    }
 
    // await bot.sendMessage(chatId, 'Welcome on out Bot', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [{text: 'text 1', web_app: {url: siteUrl}}]
    //         ]
    //     }
    // });

    // [{text: 'Запустить приложение', web_app: {url: `${siteUrl}?id=${from.id}`}}],
});

const web_app_data = async (msg) => {
    const {cart, formData} = JSON.parse(msg.web_app_data.data);
    const {name, phone, email, address, comment} = formData;

    const products = cart.map(item => item.name).join("\n");
    const totalPrice = getTotalPrice(cart);

    let text = `ФИО: ${name}\n`;
    text += `Номер телефона: ${phone}\n`;
    text += `E-mail: ${email}\n`;
    text += `Адрес доставки: ${address}\n`;
    text += `Комментарий к заказу: ${comment}\n\n`;
    text += `Ваш заказ: \n${products}\n\nИтого: ${totalPrice}₽`;
    return await bot.sendMessage(chatId, text);
}

const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += parseInt(item.price)
    }, 0)
}