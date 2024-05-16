const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();
const axios = require("axios");
const moment = require("moment-timezone");
const mongoose = require("mongoose");
const User = require("./userModel");

const {
  updateLastInteraction,
  checkInactiveUsers,
  updateUserStatus,
} = require("./Admin/statsfunction");

const {
  handleAdminAuthentication,
  adminMenuKeyboard,
} = require("./Admin/admin");

const BOT_TOKEN = "6945219875:AAGTT43vzuo_ychTX_w2HCdD_og2cSb5AcM";
const CHANNEL_ID = -1002092994311;

const bot = new Telegraf(BOT_TOKEN);

// CONNECT TO DATABASE
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// UPADTE INTERACTION TIME ON EVERY MESSAGE SEND BY THE USER
bot.use(async (ctx, next) => {
  try {
    const { id } = ctx.from;
    await updateLastInteraction(id);
  } catch (error) {
    console.error("Error updating last interaction time:", error);
  }
  next();
});

// REACTIVATE USER ON MESSAGE IF THE USER MARK AS DELETED FOR NOT INTREACTING WITH BOT IN 31 DAYS
bot.use(async (ctx, next) => {
  const { from } = ctx;
  const userId = from.id;

  try {
    await updateUserStatus(userId);
  } catch (error) {
    console.error("Error updating user status:", error);
  }
  next();
});

// MENU KEYBOARD
const menuKeyboard = Markup.keyboard([
  ["ADMIN"],
  ["INVITE", "BALANCE"],
  ["HELP & SUPPORT"],
  ["ADMIN PANEL"],
]).resize();

// HANDLE THE FUNCTION FOR WHEN THE USER IN ADMIN SECTION
const adminState = {};

// TO PREVENT OPTION WORKING IN OTHER OPTIONS
let activeMode = null;

// Array of different start messages

const startMessages = [
  {
    message:
      "Ｈｅｌｌｏ ${username}! Ｙｏｕ ｈａｖｅ ｔｏ ｊｏｉｎ ｔｈｅｓｅ ｃｈａｎｎｅｌｓ ｔｏ ｕｓｅ ｔｈｉｓ ｂｏｔ\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },

  {
    message:
      "ℍ𝕖𝕝𝕝𝕠 ${username}! 𝕐𝕠𝕦 𝕙𝕒𝕧𝕖 𝕥𝕠 𝕛𝕠𝕚𝕟 𝕥𝕙𝕖𝕤𝕖 𝕔𝕙𝕒𝕟𝕟𝕖𝕝𝕤 𝕥𝕠 𝕦𝕤𝕖 𝕥𝕙𝕚𝕤 𝕓𝕠𝕥\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "H̥ͦe̥ͦl̥ͦl̥ͦo̥ͦ ${username}!̥ͦ ̥ͦY̥ͦo̥ͦu̥ͦ ̥ͦh̥ͦḁͦv̥ͦe̥ͦ ̥ͦt̥ͦo̥ͦ ̥ͦj̥ͦo̥ͦi̥ͦn̥ͦ ̥ͦt̥ͦh̥ͦe̥ͦs̥ͦe̥ͦ ̥ͦc̥ͦh̥ͦḁͦn̥ͦn̥ͦe̥ͦl̥ͦs̥ͦ ̥ͦt̥ͦo̥ͦ ̥ͦu̥ͦs̥ͦe̥ͦ ̥ͦt̥ͦh̥ͦi̥ͦs̥ͦ ̥ͦb̥ͦo̥ͦt̥ͦ\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "нєℓℓσ ${username}! уσυ нανє тσ נσιи тнєѕє ¢нαииєℓѕ тσ υѕє тнιѕ вσт\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "ℌ𝔢𝔩𝔩𝔬 ${username}! 𝔜𝔬𝔲 𝔥𝔞𝔳𝔢 𝔱𝔬 𝔧𝔬𝔦𝔫 𝔱𝔥𝔢𝔰𝔢 𝔠𝔥𝔞𝔫𝔫𝔢𝔩𝔰 𝔱𝔬 𝔲𝔰𝔢 𝔱𝔥𝔦𝔰 𝔟𝔬𝔱\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",

    keyboard: menuKeyboard,
  },
  {
    message:
      "ʜᴇʟʟᴏ ${username}! ʏᴏᴜ ʜᴀᴠᴇ ᴛᴏ ᴊᴏɪɴ ᴛʜᴇsᴇ ᴄʜᴀɴɴᴇʟs ᴛᴏ ᴜsᴇ ᴛʜɪs ʙᴏᴛ\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "H͎e͎l͎l͎o͎ ${username}!͎ ͎Y͎o͎u͎ ͎h͎a͎v͎e͎ ͎t͎o͎ ͎j͎o͎i͎n͎ ͎t͎h͎e͎s͎e͎ ͎c͎h͎a͎n͎n͎e͎l͎s͎ ͎t͎o͎ ͎u͎s͎e͎ ͎t͎h͎i͎s͎ ͎b͎o͎t͎\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "ⱧɆⱠⱠØ ${username}! ɎØɄ Ⱨ₳VɆ ₮Ø JØł₦ ₮ⱧɆ₴Ɇ ₵Ⱨ₳₦₦ɆⱠ₴ ₮Ø Ʉ₴Ɇ ₮Ⱨł₴ ฿Ø₮\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "ɦɛʟʟօ ${username}! ʏօʊ ɦǟʋɛ ȶօ ʝօɨռ ȶɦɛֆɛ ƈɦǟռռɛʟֆ ȶօ ʊֆɛ ȶɦɨֆ ɮօȶ\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
  {
    message:
      "H͓̽e͓̽l͓̽l͓̽o͓̽ ${username!͓̽ ͓̽Y͓̽o͓̽u͓̽ ͓̽h͓̽a͓̽v͓̽e͓̽ ͓̽t͓̽o͓̽ ͓̽j͓̽o͓̽i͓̽n͓̽ ͓̽t͓̽h͓̽e͓̽s͓̽e͓̽ ͓̽c͓̽h͓̽a͓̽n͓̽n͓̽e͓̽l͓̽s͓̽ ͓̽t͓̽o͓̽ ͓̽u͓̽s͓̽e͓̽ ͓̽t͓̽h͓̽i͓̽s͓̽ ͓̽b͓̽o͓̽t͓̽\n\n<a href='https://t.me/cheemda_bot_testing_channel'>@cheemda_bot_testing_channel</a>",
    keyboard: menuKeyboard,
  },
];

// HANDLE /START COMMAND

bot.command("start", async (ctx) => {
  const { id, username, first_name, last_name } = ctx.from;
  let message;
  try {
    // CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ userId: id });

    if (existingUser) {
      const username = ctx.message.from.username;
      const randomIndex = Math.floor(Math.random() * startMessages.length);
      message = startMessages[randomIndex].message.replace(
        "${username}",
        username
      );
      const keyboard = startMessages[randomIndex].keyboard; // Replace ${username} placeholder without '@' symbol
    } else {
      const newUser = new User({
        userId: id,
        username: username,
        name: `${first_name} ${last_name}`,
      });
      await newUser.save();
      ctx.reply(startMessages);
    }
  } catch (error) {
    console.error("Error saving new user:", error);
    ctx.reply(
      "An error occurred while saving your information. Please try again later."
    );
  }

  ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Check",
            callback_data: "check",
          },
        ],
      ],
    },
  });
});

// HANDLE CHECK OPTION

bot.action("check", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);

    if (!isChannelMember) {
      ctx.reply("Please join the required channel to proceed.");
    } else {
      // User is a member of the channel, send a message with keyboard
      ctx.reply("You have successfully joined the required channel.",menuKeyboard)
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// Function to handle options

// HANDLE HUEHUE

bot.hears("ADMIN", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);

    if (!isChannelMember) {
      ctx.reply("You need to join the required channel to access this option.");
    } else {
      // User is a member of the channel, reply with "Fuck you"
      ctx.reply("ADMIN");
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// HANDLE AMMA BEHEN PR AJAUNGA

bot.hears("BALANCE", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);

    if (!isChannelMember) {
      ctx.reply("You need to join the required channel to access this option.");
    } else {
      // User is a member of the channel, reply with "Fuck you"
      ctx.reply("BALANCE");
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// HANDLE AWRE YAAWR AAP BHI NA

bot.hears("INVITE", async (ctx) => {
  const userId = ctx.from.id;
  const referralLink = `https://t.me/Cheemda_testing_bot?start=${ctx.from.id}`;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);
   
    if (!isChannelMember) {
      ctx.reply("You need to join the required channel to access this option.");
    } else {
      // User is a member of the channel, reply with "Fuck you"
      ctx.reply(`Your referral link is: ${referralLink}`);
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// HANDLE BAIGAN

bot.hears("HELP & SUPPORT", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);

    if (!isChannelMember) {
      ctx.reply("You need to join the required channel to access this option.");
    } else {
      // User is a member of the channel, reply with "Fuck you"
      ctx.reply("HELP & SUPPORT");
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// HANDLE STATS

bot.hears("STATS", async (ctx) => {
  // CHECK IF USER IS AN ADMIN
  if (ctx.from.id === parseInt(process.env.CHAT_ID)) {
    try {
      // GET STATIC INFO FROM DATABASE
      const totalUsersCount = await User.countDocuments({});
      const activeUsersCount = await User.countDocuments({
        active: true,
        deleted: false,
      });
      const deletedUsersCount = await User.countDocuments({ deleted: true });

      // SEND STATICS
      const message = `Total Users: ${totalUsersCount}\nActive Users: ${activeUsersCount}\nDeleted Users: ${deletedUsersCount}`;
      await ctx.reply(message);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      await ctx.reply("Error fetching statistics. Please try again later.");
    }
  } else {
    await ctx.reply("You are not authorized to view statistics.");
  }
});

bot.hears("MAIN MENU", async (ctx) => {
  const userId = ctx.from.id;

  try {
    const isChannelMember = await checkChannelMembership(userId, CHANNEL_ID);

    if (!isChannelMember) {
      ctx.reply("You need to join the required channel to access this option.");
    } else {
      // User is a member of the channel, reply with "Fuck you"
      ctx.reply("MAIN MENU", menuKeyboard);
    }
  } catch (error) {
    console.error("Error checking membership:", error);
    ctx.reply("Error checking membership. Please try again later.");
  }
});

// FUNCTION TO CHECK IS THE USER IS IN CHANNEL OR NOT

async function checkChannelMembership(userId, channelId) {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: channelId,
          user_id: userId,
        },
      }
    );
    return (
      response.data.ok &&
      ["member", "administrator", "creator"].includes(
        response.data.result.status
      )
    );
  } catch (error) {
    console.error("Error checking channel membership:", error);
    throw error;
  }
}

bot.hears("ADMIN PANEL", (ctx) => {
  activeMode = "admin panel";
  // Set the admin state to prompt for ID
  adminState[ctx.from.id] = { step: "prompt_id", inAdminPanel: true };
  ctx.reply("Please enter your admin ID:");
});

bot.on("text", async (ctx) => {
  const { text } = ctx.message;
  if (activeMode === "admin panel");
  {
    handleAdminAuthentication(
      ctx,
      adminState,
      process.env.CHAT_ID.split(","),
      adminMenuKeyboard
    );
  }
});

setInterval(checkInactiveUsers, 604800000);

bot.launch();
