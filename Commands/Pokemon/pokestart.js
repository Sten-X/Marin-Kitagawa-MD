const { mkpokemon } = require("../../Database/dataschema.js");

module.exports = {
    name: "pokestart",
    alias: ["startpoke", "startpokemon"],
    desc: "Start your Pokemon Journey",
    category: "Pokemon",
    usage: "pokestart <charmander/squirtle/bulbasaur>",
    react: "🦕",
    start: async (Miku, m, { args, prefix, pushName }) => {
        
        // Check if already started
        const checkPoke = await mkpokemon.findOne({ owner: m.sender });
        if (checkPoke) return m.reply("You already have a starter Pokémon! Use *hunt* to find more.");

        if (!args[0]) {
            let buttons = [
                { buttonId: `${prefix}pokestart charmander`, buttonText: { displayText: "🔥 Charmander" }, type: 1 },
                { buttonId: `${prefix}pokestart squirtle`, buttonText: { displayText: "💧 Squirtle" }, type: 1 },
                { buttonId: `${prefix}pokestart bulbasaur`, buttonText: { displayText: "🌿 Bulbasaur" }, type: 1 }
            ];
            return Miku.sendButtonText(m.from, buttons, `👋 Hello ${pushName}! Welcome to the world of Pokémon!\n\nChoose your starter companion!`, `*${global.botName} Oak Lab*`, m);
        }

        const choice = args[0].toLowerCase();
        let pokeData = {};

        if (choice === "charmander") pokeData = { id: 4, name: "Charmander", url: "https://img.pokemondb.net/artwork/large/charmander.jpg" };
        else if (choice === "squirtle") pokeData = { id: 7, name: "Squirtle", url: "https://img.pokemondb.net/artwork/large/squirtle.jpg" };
        else if (choice === "bulbasaur") pokeData = { id: 1, name: "Bulbasaur", url: "https://img.pokemondb.net/artwork/large/bulbasaur.jpg" };
        else return m.reply("❌ Invalid starter! Choose Charmander, Squirtle, or Bulbasaur.");

        await new mkpokemon({
            owner: m.sender,
            pokeId: pokeData.id,
            name: pokeData.name,
            level: 5,
            shiny: false
        }).save();

        let buttons = [{ buttonId: `${prefix}pokedex`, buttonText: { displayText: "📖 Check Pokedex" }, type: 1 }];

        await Miku.sendMessage(m.from, {
            image: { url: pokeData.url },
            caption: `🎉 *Congratulations!* \n\nYou chose *${pokeData.name}* as your partner! 🔴\n\nYour journey begins now!`,
            footer: `*${global.botName} Pokemon*`,
            buttons: buttons,
            type: 4
        }, { quoted: m });
    }
};