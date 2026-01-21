const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "poketrain",
    alias: ["trainpoke", "trainpokemon"],
    desc: "Train your Pokemon to increase ATK/DEF stats",
    category: "Pokemon",
    usage: "poketrain <name>",
    react: "💪",
    start: async (Miku, m, { text, eco, prefix }) => {
        if (!text) return m.reply(`Who do you want to train? 💪\nUsage: *${prefix}poketrain Mewtwo*`);

        const myPoke = await mkpokemon.findOne({ 
            owner: m.sender, 
            name: { $regex: new RegExp("^" + text + "$", "i") } 
        });

        if (!myPoke) return m.reply(`🚫 You don't own ${text}!`);

        // Training Cost
        const cost = myPoke.level * 200;
        const balance = await eco.balance(m.sender, "cara");

        if (balance.wallet < cost) {
            return m.reply(`💸 Training costs *${cost}* Gold! You need more money.`);
        }

        // Deduct Money
        await eco.deduct(m.sender, "cara", cost);

        // Boost Stats
        const atkBoost = Math.floor(Math.random() * 5) + 1;
        const defBoost = Math.floor(Math.random() * 5) + 1;

        myPoke.trainedAtk += atkBoost;
        myPoke.trainedDef += defBoost;
        
        // Training se thoda XP bhi milta hai
        myPoke.exp += 50;

        await myPoke.save();

        let buttons = [{ buttonId: `${prefix}pokebattle`, buttonText: { displayText: "⚔️ Test Power" }, type: 1 }];

        await Miku.sendMessage(m.from, {
            image: {url : botImage2}, // Gym Image
            caption: `💪 *Training Complete!* 💪\n\n*${myPoke.name}* worked hard at the gym!\n\n⚔️ *ATK Increased:* +${atkBoost}\n🛡️ *DEF Increased:* +${defBoost}\n💸 *Cost:* ${cost} Gold\n\nYour Pokémon is getting stronger!`,
            footer: `*${global.botName} Gym*`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};