const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokeprotect",
    alias: ["protectpoke"],
    desc: "Lock/Unlock a Pokemon to prevent accidental release",
    category: "Pokemon",
    usage: "pokeprotect <name>",
    react: "🛡️",
    start: async (Miku, m, { text, prefix }) => {
        if (!text) return m.reply(`Usage: *${prefix}pokeprotect Charizard*`);

        const myPoke = await mkpokemon.findOne({ 
            owner: m.sender, 
            name: { $regex: new RegExp("^" + text + "$", "i") } 
        });

        if (!myPoke) return m.reply(`🚫 You don't own ${text}!`);

        // Toggle Status
        if (myPoke.protected) {
            myPoke.protected = false;
            await myPoke.save();
            return m.reply(`🔓 *Unlocked!* \n\n*${myPoke.name}* is no longer protected. Be careful!`);
        } else {
            myPoke.protected = true;
            await myPoke.save();
            return m.reply(`🛡️ *Protected!* \n\n*${myPoke.name}* is now locked. You cannot release or trade it.`);
        }
    }
};