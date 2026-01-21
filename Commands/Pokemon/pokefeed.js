const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokefeed",
    alias: ["feedpoke"],
    desc: "Feed your Pokemon to increase XP and Happiness",
    category: "Pokemon",
    usage: "pokefeed <name>",
    react: "🍓",
    start: async (Miku, m, { text, eco, prefix }) => {
        if (!text) return m.reply(`Who do you want to feed? 🍓\nUsage: *${prefix}pokefeed Pikachu*`);

        const myPoke = await mkpokemon.findOne({ 
            owner: m.sender, 
            name: { $regex: new RegExp("^" + text + "$", "i") } 
        });

        if (!myPoke) return m.reply(`🚫 You don't own a Pokémon named ${text}!`);

        // Cost Logic
        const cost = 50;
        const balance = await eco.balance(m.sender, "cara");
        if (balance.wallet < cost) return m.reply(`💸 You need *${cost}* Gold to buy a Berry!`);

        // Deduct Money
        await eco.deduct(m.sender, "cara", cost);

        // Update Stats
        const xpGain = Math.floor(Math.random() * 50) + 20; // 20-70 XP
        const happyGain = Math.floor(Math.random() * 5) + 1; // 1-5 Happiness

        myPoke.exp += xpGain;
        myPoke.happiness = Math.min(100, myPoke.happiness + happyGain); // Max 100
        myPoke.currentHp = Math.min(myPoke.maxHp, myPoke.currentHp + 20); // Heal 20 HP

        // Level Up Logic
        let levelUpMsg = "";
        if (myPoke.exp >= myPoke.level * 100) {
            myPoke.level += 1;
            myPoke.exp = 0;
            myPoke.maxHp += 10; // HP Boost on Level Up
            myPoke.currentHp = myPoke.maxHp; // Full Heal
            levelUpMsg = `\n🆙 *LEVEL UP!* It grew to Level ${myPoke.level}!`;
        }

        await myPoke.save();

        let buttons = [{ buttonId: `${prefix}pokeinfo ${myPoke.name}`, buttonText: { displayText: "📊 Check Stats" }, type: 1 }];

        await Miku.sendMessage(m.from, {
            image: {url : botImage2},
            caption: `🍓 *Yummy!* 🍓\n\nYou fed *${myPoke.name}* a Golden Berry!\n\n✨ *XP Gained:* +${xpGain}\n❤️ *Happiness:* ${myPoke.happiness}/100\n💚 *HP Restored:* +20${levelUpMsg}`,
            footer: `*${global.botName} Care*`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};