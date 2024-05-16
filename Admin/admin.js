const { Telegraf, Markup } = require('telegraf');


// CONNECT THE TELEGRAF TO BOT
const bot = new Telegraf(process.env.BOT_TOKEN);


// FUNCTION TO SEND VIDEO AND MESSAGE FOR UNAUTHORIZED USER
function sendUnauthorizedVideo(chatId, inAdminPanel) {
    if (inAdminPanel) {
        const videoPath = './media/0316.mp4'; // Update the path
        bot.telegram.sendVideo(chatId, { source: videoPath }, {
            caption: 'You are not authorized to access this feature.',
        }).catch((err) => {
            console.error('Error sending video:', err);
        });
    }
}


// FUNCTION TO SEND VIDEO AND MESSAGE FOR INCORRECT DETAILS
function sendIncorrectDetailsVideo(chatId, inAdminPanel) {
    if (inAdminPanel) {
        const videoPath = './media/0316.mp4';
        bot.telegram.sendVideo(chatId, { source: videoPath }, {
            caption: 'PAKDA GAYA',
        }).catch((err) => {
            console.error('ERROR SENDING VIDEO', err);
        });
    }
}

// ADMIN KEYBOARD
const adminMenuKeyboard = Markup.keyboard([
    ['Option 1', 'STATS'],
    ['Option 3', 'Option 4'],
    ['MAIN MENU']
]).resize();


// FUNCTION TO HANDLE ADMIN AUTHENTICATION
function handleAdminAuthentication(ctx, adminState, allowedChatIds) {
    const userId = ctx.from.id;
    const currentState = adminState[userId];
    const chatId = ctx.chat.id;

    // CHECK IS USER IS ADMIN BY MATCH USER CHAT ID TO ADMIN CHAT ID 
    if (!allowedChatIds.includes(String(chatId))) {
        // SEND VIDEO AND MESSAGE TO UNAUTHORIZED USER 
        sendUnauthorizedVideo(chatId, currentState && currentState.inAdminPanel);
        return;
    }

    // AUTHENTICATE USER TO USE ADMIN FEATURES
    if (currentState && currentState.step === 'prompt_id') {
        const adminId = process.env.ADMIN_ID;
        const enteredId = ctx.message.text.trim();

        if (enteredId === adminId) {
            // ID is correct, prompt for password
            adminState[userId].step = 'prompt_password';
            ctx.reply('Please enter your password:');
        } else {
            // ID is incorrect, send video and message
            sendIncorrectDetailsVideo(chatId, currentState && currentState.inAdminPanel);
        }
    } else if (currentState && currentState.step === 'prompt_password') {
        // Check password
        const password = process.env.ADMIN_PASSWORD;
        const enteredPassword = ctx.message.text.trim();

        if (enteredPassword === password) {
            // Successful authentication, show admin menu
            adminState[userId].step = 'authenticated';
            ctx.reply('Authentication successful! Here is the admin menu:', adminMenuKeyboard);
        } else {
            // Password is incorrect, send video and message
            sendIncorrectDetailsVideo(chatId, currentState && currentState.inAdminPanel);
        }
    }
}


module.exports = { handleAdminAuthentication };
