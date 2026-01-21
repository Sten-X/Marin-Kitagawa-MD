// Commands/RPG/reg-inv.js
const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { player } = require("../../Database/rpgschema.js");

module.exports = {
  name: "reg-inv",
  desc: "Register your RPG inventory.",
  alias: ["register-inv"],
  category: "RPG",
  usage: "reg-inv",
  start: async (Miku, m, { prefix }) => {
    let user = await player.findOne({ id: m.sender });
    if (!user) {
      await player.create({
        id: m.sender,
        // name: pushName // if you want, you can add it. Just take pushName in params
      });

      return Miku.sendMessage(
        m.from,
        {
          text: `🧺 *Inventory Created, Senpai!* \n\nYour mining profile has been created~ ⛏️\nUse \`${prefix}inventory\` to check your items.`,
        },
        { quoted: m }
      );
    } else {
      return Miku.sendMessage(
        m.from,
        {
          text: `📦 *Already Registered!*\n\nYou already have an inventory.\nUse \`${prefix}inventory\` to view it.`,
        },
        { quoted: m }
      );
    }
  },
};
