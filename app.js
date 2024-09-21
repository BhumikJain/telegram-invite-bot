import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import axios from "axios";
// import moment from "moment-timezone";
import User from "./models/userModel.js";
dotenv.config(".env");

import {
  updateLastInteraction,
  checkInactiveUsers,
  updateUserStatus,
} from "./Admin/statsfunction.js";

import { handleAdminAuthentication, adminMenuKeyboard } from "./Admin/admin.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new Telegraf(BOT_TOKEN);

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
import { menuKeyboard } from "./startMessage/menuKeyboard.js";

// HANDLE THE FUNCTION FOR WHEN THE USER IN ADMIN SECTION
const adminState = {};

// TO PREVENT OPTION WORKING IN OTHER OPTIONS
let activeMode = null;

// Array of different start messages

import { startMessages } from "./startMessage/messages.js";

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
      ctx.reply(
        "You have successfully joined the required channel.",
        menuKeyboard
      );
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
