import {  Markup } from "telegraf";

const menuKeyboard = Markup.keyboard([
    ["ADMIN"],
    ["INVITE", "BALANCE"],
    ["HELP & SUPPORT"],
    ["ADMIN PANEL"],
  ]).resize();

  export  {menuKeyboard}