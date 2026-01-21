const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { mk } = require("../../Database/dataschema.js"); // mk hi GroupSchema hai

module.exports = {
    name: "pokeswitch",
    alias: ["pokemon", "poke"],
    desc: "Enable or disable Pokemon commands/spawning in a group",
    category: "Group",
    usage: "pokeswitch [on/off]",
    react: "🔴",
    start: async (
      Miku,
      m,
      { args, isBotAdmin, isAdmin, isCreator, reply, prefix, pushName }
    ) => {
      
        if (!isAdmin)
        return Miku.sendMessage(
          m.from,
          {
            text: `*${pushName}* must be *Admin* to turn ON/OFF Pokemon System!`,
          },
          { quoted: m }
        );
  
      let checkdata = await mk.findOne({ id: m.from });
      
      if (args[0] === "on") {
        if (!checkdata) {
          await new mk({ id: m.from, pokemonSystem: "true" }).save();
          Miku.sendMessage(
            m.from,
            { text: `*Pokemon System* has been *Activated* in this group! 🔴\nWild Pokémon will now appear randomly.` },
            { quoted: m }
          );
        } else {
          if (checkdata.pokemonSystem == "true")
            return Miku.sendMessage(
                m.from,
                { text: `*Pokemon System* is already *Activated* in this group!` },
                { quoted: m }
              );
          await mk.updateOne({ id: m.from }, { pokemonSystem: "true" });
          return Miku.sendMessage(
            m.from,
            { text: `*Pokemon System* has been *Activated* in this group! 🔴\nWild Pokémon will now appear randomly.` },
            { quoted: m }
          );
        }
      } else if (args[0] === "off") {
        if (!checkdata) {
          await new mk({ id: m.from, pokemonSystem: "false" }).save();
          return Miku.sendMessage(
            m.from,
            { text: `*Pokemon System* has been *De-Activated* in this group!` },
            { quoted: m }
          );
        } else {
          if (checkdata.pokemonSystem == "false") return Miku.sendMessage(
            m.from,
            { text: `*Pokemon System* is already *De-Activated* in this group!` },
            { quoted: m }
          );
          await mk.updateOne({ id: m.from }, { pokemonSystem: "false" });
          return Miku.sendMessage(
            m.from,
            { text: `*Pokemon System* has been *De-Activated* in this group!` },
            { quoted: m }
          );
        }
      } else {
        let buttons = [
          {
            buttonId: `${prefix}pokeswitch on`,
            buttonText: { displayText: "On" },
            type: 1,
          },
          {
            buttonId: `${prefix}pokeswitch off`,
            buttonText: { displayText: "Off" },
            type: 1,
          },
        ];

        let bmffg = {
          image: {url : botImage5}, 
          caption: `*Pokemon System Configuration* 🔴\n\nPlease click the button below to turn On or Off.\n`,
          footer: `*${global.botName}*`,
          buttons: buttons,
          headerType: 4,
        };
        await Miku.sendMessage(m.from, bmffg, { quoted: m });
    }
  },
};