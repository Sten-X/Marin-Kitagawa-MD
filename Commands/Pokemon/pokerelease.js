const { mkpokemon, mku } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokerelease",
    alias: ["sellpoke"],
    desc: "Release a Pokemon for money",
    category: "Pokemon",
    usage: "release <name>",
    react: "👋",
    start: async (Miku, m, { text, eco, prefix }) => {

        if (!text) return m.reply(`Which Pokemon to release? Usage: *${prefix}release Pidgey*`);

        const myPoke = await mkpokemon.findOne({ owner: m.sender, name: { $regex: new RegExp("^" + text + "$", "i") } });

        if (!myPoke) return m.reply("🚫 You don't own this Pokemon!");

        // Calculation: Level * 100 Gold
        const price = myPoke.level * 100;

        await mkpokemon.deleteOne({ _id: myPoke._id });
        await eco.give(m.sender, "cara", price);

        let buttons = [{ buttonId: `${prefix}wallet`, buttonText: { displayText: "💰 Check Wallet" }, type: 1 }];

        await Miku.sendButtonText(m.from, buttons, 
            `👋 *Goodbye ${myPoke.name}!* \n\nYou released your Pokemon back into the wild.\n💰 You received *${price}* Gold/Cara for your efforts!`,
            `*${global.botName} Lab*`, 
            m
        );
    }
};