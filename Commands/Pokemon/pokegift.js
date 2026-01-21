const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokegift",
    alias: ["givepoke", "giftpokemon"],
    desc: "Gift a Pokemon to another user",
    category: "Pokemon",
    usage: "pokegift <pokemon_name> @user",
    react: "🎁",
    start: async (Miku, m, { args, mentionByTag, prefix }) => {
        if (!args[0] || !mentionByTag[0]) return m.reply(`🎁 Usage: *${prefix}pokegift Pikachu @user*`);

        const pokeName = args[0];
        const recipient = mentionByTag[0];
        const sender = m.sender;

        if (recipient === sender) return m.reply("😐 You can't gift yourself!");

        // Find Pokemon
        const myPoke = await mkpokemon.findOne({ 
            owner: sender, 
            name: { $regex: new RegExp("^" + pokeName + "$", "i") } 
        });

        if (!myPoke) return m.reply(`🚫 You don't own a Pokemon named ${pokeName}!`);

        // Transfer Ownership
        myPoke.owner = recipient;
        await myPoke.save();

        await Miku.sendMessage(m.from, {
            text: `🎁 *Pokemon Transferred!* \n\nUser @${sender.split('@')[0]} sent *${myPoke.name}* (Lvl ${myPoke.level}) to @${recipient.split('@')[0]}!`,
            mentions: [sender, recipient]
        }, { quoted: m });
    }
};