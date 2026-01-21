const fs = require("fs");
const { mku } = require("../../Database/dataschema.js");

module.exports = {
  name: "join",
  alias: ["joingc"],
  desc: "Ask bot to join a WhatsApp group",
  category: "Mods",
  usage: "join <group link>",
  react: "😶",
  start: async (Miku, m, { args, text, prefix, isCreator, pushName, modStatus }) => {
    
    if (modStatus === "false" && !isCreator) {
      return Miku.sendMessage(m.from, { text: '❌ Only *Owner* and *Mods* can use this command!' }, { quoted: m });
    }

    if (!text || !args[0].includes("whatsapp.com")) {
      return Miku.sendMessage(m.from, { text: '❌ Please provide a valid WhatsApp group link!' }, { quoted: m });
    }

    let gcJoinCode = args[0].split("https://chat.whatsapp.com/")[1];

    try {
      await Miku.groupAcceptInvite(gcJoinCode);
      await Miku.sendMessage(m.from, { text: `✅ Successfully joined the group!` }, { quoted: m });
    } catch (e) {
      console.error("Join Group Error:", e);
      await Miku.sendMessage(m.from, { text: `❌ Failed to join group! Maybe the link is invalid, expired, or I was removed before.` }, { quoted: m });
    }
  },
};
