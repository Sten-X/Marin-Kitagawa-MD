const { mkpokemon, mkbattle } = require("../../Database/dataschema.js");
const { getPokemon } = require("../../lib/pokeGame.js");

module.exports = {
    name: "setpokemon",
    alias: ["pokeset"], // 'setmain' alias add kar diya
    desc: "Set your main Pokemon for battles",
    category: "Pokemon",
    usage: "setbuddy <pokemon_name>",
    react: "🦕",
    start: async (Miku, m, { text, prefix }) => {
        
        // 1. Input Check
        if (!text) return m.reply(`Which Poke You Want To Make 🤔\nUsage: *${prefix}setbuddy Pikachu*`);

        const searchTerm = text.trim();

        // 2. Find Pokemon (Naam YA Nickname dono check karega)
        // Hum user ke inventory mein dhoond rahe hain
        const myPoke = await mkpokemon.findOne({ 
            owner: m.sender, 
            $or: [
                { name: { $regex: new RegExp("^" + searchTerm + "$", "i") } }, // Asli naam match (case insensitive)
                { nickname: { $regex: new RegExp("^" + searchTerm + "$", "i") } } // Nickname match
            ]
        });

        if (!myPoke) {
            return m.reply(`🚫 Senpai, You Have Any *"${searchTerm}"* Name Pokemon!\nCheck You Collection: *${prefix}pokedex*`);
        }

        // 3. Update Battle Profile (Safe Method)
        // upsert: true ka matlab agar profile nahi hai to nayi bana dega
        await mkbattle.findOneAndUpdate(
            { userId: m.sender },
            { $set: { mainPokeId: myPoke._id } },
            { upsert: true, new: true }
        );
        // 4. Confirmation Message with Buttons
        try {
            const apiData = await getPokemon(myPoke.pokeId);
            if (apiData && apiData.image) displayImage = apiData.image;
        } catch (e) {
            console.log("Image fetch failed in setbuddy");
        }

        let buttons = [
            { buttonId: `${prefix}pokebattle`, buttonText: { displayText: "⚔️ Battle Now" }, type: 1 },
            { buttonId: `${prefix}pokeinfo ${myPoke.name}`, buttonText: { displayText: "📊 Check Stats" }, type: 1 }
        ];

        let msg = `✅ *Main Fighter Updated!* \n\n` +
                  `🔴 *${myPoke.name}* (Lvl ${myPoke.level}) is now your Buddy!\n` +
                  `✨ *Shiny:* ${myPoke.shiny ? "Yes" : "No"}\n\n` +
                  `It will now fight for you in battles! Go get 'em! 🔥`;

        await Miku.sendMessage(m.from, {
            image: {url : botImage5},
            caption: msg,
            footer: `*${global.botName} Trainer*`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};