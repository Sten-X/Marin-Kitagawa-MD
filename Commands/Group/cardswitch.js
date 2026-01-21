const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { mk } = require("../../Database/dataschema.js"); // mk hi GroupSchema hai

module.exports = {
    name: "cardswitch",
    alias: ["cardsystem", "cardgame", "cards"],
    desc: "Enable or disable Card commands in a group",
    category: "Group",
    usage: "cardswitch [on/off]",
    react: "🎴",
    start: async (
      Miku,
      m,
      { args, isBotAdmin, isAdmin, isCreator, reply, prefix, pushName }
    ) => {
      
        if (!isAdmin)
        return Miku.sendMessage(
          m.from,
          {
            text: `*${pushName}* must be *Admin* to turn ON/OFF Card System!`,
          },
          { quoted: m }
        );
  
      let checkdata = await mk.findOne({ id: m.from });
      
      if (args[0] === "on") {
        if (!checkdata) {
          await new mk({ id: m.from, cardSystem: "true" }).save();
          Miku.sendMessage(
            m.from,
            { text: `*Card System* has been *Activated* in this group! 🎴` },
            { quoted: m }
          );
        } else {
          if (checkdata.cardSystem == "true")
            return Miku.sendMessage(
                m.from,
                { text: `*Card System* is already *Activated* in this group!` },
                { quoted: m }
              );
          await mk.updateOne({ id: m.from }, { cardSystem: "true" });
          return Miku.sendMessage(
            m.from,
            { text: `*Card System* has been *Activated* in this group! 🎴` },
            { quoted: m }
          );
        }
      } else if (args[0] === "off") {
        if (!checkdata) {
          await new mk({ id: m.from, cardSystem: "false" }).save();
          return Miku.sendMessage(
            m.from,
            { text: `*Card System* has been *De-Activated* in this group!` },
            { quoted: m }
          );
        } else {
          if (checkdata.cardSystem == "false") return Miku.sendMessage(
            m.from,
            { text: `*Card System* is already *De-Activated* in this group!` },
            { quoted: m }
          );
          await mk.updateOne({ id: m.from }, { cardSystem: "false" });
          return Miku.sendMessage(
            m.from,
            { text: `*Card System* has been *De-Activated* in this group!` },
            { quoted: m }
          );
        }
      } else {
        let buttons = [
          {
            buttonId: `${prefix}cardswitch on`,
            buttonText: { displayText: "On" },
            type: 1,
          },
          {
            buttonId: `${prefix}cardswitch off`,
            buttonText: { displayText: "Off" },
            type: 1,
          },
        ];
        let bmffg = {
          image: {url : botImage5}, // Aap koi bhi botImage use kar sakte hain
          caption: `*Card System Configuration* 🎴\n\nPlease click the button below to turn On or Off.\n`,
          footer: `*${botName}*`,
          buttons: buttons,
          headerType: 4,
        };
        await Miku.sendMessage(m.from, bmffg, { quoted: m });
    }
  },
};