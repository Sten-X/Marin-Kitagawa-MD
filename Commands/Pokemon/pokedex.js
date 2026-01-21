const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokedex",
    alias: ["pokedeck"],
    desc: "View your caught Pokémon collection",
    category: "Pokemon",
    usage: "pokedex",
    react: "🍁",
    start: async (Miku, m, { prefix, pushName }) => {
        
        // 1. Fetch User's Pokemon (Seedha database se)
        const userPoke = await mkpokemon.find({ owner: m.sender });

        // 2. Check Empty
        if (!userPoke || userPoke.length === 0) {
            let buttons = [
                { buttonId: `${prefix}pokestart`, buttonText: { displayText: "🎗️ Start Journey" }, type: 1 }
            ];
            return Miku.sendButtonText(m.from, buttons, `🎀 *Your Pokedex is Empty!* \n\nYou haven't caught any Pokémon yet.\nUse *${prefix}pokestart* or *${prefix}hunt* to begin!`, `*${global.botName}*`, m);
        }

        // 3. Sorting Logic (Strongest / High Level first)
        userPoke.sort((a, b) => b.level - a.level);

        // 4. Generate List Text
        let msg = `〽️ *${pushName}'s Pokedex* \n` +
                  `🏮 *Total Caught:* ${userPoke.length}\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Display Limit (Top 20 dikhayenge taaki message lamba na ho)
        const displayLimit = 20;
        
        userPoke.slice(0, displayLimit).forEach((p, i) => {
            const shinyIcon = p.shiny ? "✨ " : ""; // Shiny hai to star dikhao
            const nickname = p.nickname ? `_(${p.nickname})_` : ""; // Nickname agar hai
            
            msg += `*${i + 1}.* ${shinyIcon}*${p.name}* ${nickname} [Lvl ${p.level}]\n`;
        });

        if (userPoke.length > displayLimit) {
            msg += `\n...and *${userPoke.length - displayLimit}* more waiting in PC.`;
        }

        msg += `\n━━━━━━━━━━━━━━━━━━━━\n` +
               `💡 *Tip:* Use *${prefix}pokeinfo <name>* to check stats or *${prefix}setmain <name>* to equip!`;

        // 5. Buttons
        let buttons = [
            { buttonId: `${prefix}hunt`, buttonText: { displayText: "🔍 Hunt More" }, type: 1 }
        ];


        await Miku.sendMessage(m.from, {
            image: {url : botImage5} ,
            caption: msg,
            footer: `*${global.botName} Pokedex*`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};