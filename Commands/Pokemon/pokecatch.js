const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "catch",
    alias: ["catchpoke"],
    desc: "Catch a wild Pokémon",
    category: "Pokemon",
    usage: "catch <name>",
    react: "🍁",
    start: async (Miku, m, { text, prefix }) => {
        
        if (!global.wildPokemon || !global.wildPokemon.has(m.from)) return m.reply("There is no wild Pokémon here! Use *hunt* first.");

        const wildPoke = global.wildPokemon.get(m.from);

        if (!text) return m.reply(`Which Pokémon? Usage: *${prefix}catch Pikachu*`);

        if (text.toLowerCase() !== wildPoke.name.toLowerCase()) {
            return m.reply("❌ Wrong name! The Pokémon broke free!");
        }

        // Save to DB
        await new mkpokemon({
            owner: m.sender,
            pokeId: wildPoke.id,
            name: wildPoke.name,
            level: Math.floor(Math.random() * 15) + 1, 
            shiny: wildPoke.isShiny
        }).save();

        global.wildPokemon.delete(m.from);

        const shinyMsg = wildPoke.isShiny ? "✨ *SHINY* " : "";
        let buttons = [{ buttonId: `${prefix}pokedex`, buttonText: { displayText: "📖 Pokedex" }, type: 1 }];

        await Miku.sendMessage(m.from, {
            image: { url: wildPoke.image },
            caption: `🎉 *Gotcha!* 🎉\n\n${wildPoke.name} was caught!\n${shinyMsg}\n\nIt has been added to your PC.`,
            footer: `*${global.botName} *`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};