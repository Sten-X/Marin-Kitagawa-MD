const { mk } = require("../Database/dataschema.js");
const { getPokemon, getRandomPokeID } = require("./pokeGame.js");

if (!global.wildPokemon) global.wildPokemon = new Map();

let isPokeSpawnerRunning = false;

async function startPokeAutoSpawn(Miku) {
    if (isPokeSpawnerRunning) return;
    isPokeSpawnerRunning = true;

    setInterval(async () => {
        try {
            const enabledGroups = await mk.find({ pokemonSystem: "true" });
            if (!enabledGroups || enabledGroups.length === 0) return;

            for (const group of enabledGroups) {
                const groupJid = group.id;

                if (global.wildPokemon.has(groupJid)) continue;

                const id = getRandomPokeID();
                const poke = await getPokemon(id);

                if (!poke) continue;

                global.wildPokemon.set(groupJid, poke);

                const shinyText = poke.isShiny ? "✨ *SHINY ENCOUNTER!* ✨\n" : "";
                
                // --- NEW DETAILED CAPTION ---
                const caption = `${shinyText} *A Wild Pokémon Appeared!* \n\n` +
                                `Guess the Pokémon to catch it!\n` +
                                `Usage: *${global.prefa}catch <name>*\n\n` +
                                `🎀 *Type:* ${poke.type}\n` +
                                `🧬 *Gen:* ${poke.gen}\n` +
                                `🛠️ *Abilities:* ${poke.abilities}\n\n` +
                                `📖 *Pokedex Entry:*\n_${poke.desc}_\n\n` +
                                `〽️ *Base Stats:*\n` +
                                `🫀 HP: ${poke.hp} | 🗡️ ATK: ${poke.atk}\n` +
                                `🔰 DEF: ${poke.def} | ⚡ SPD: ${poke.spd}\n\n` +
                                `⏳ *Flees in 2 minutes!*`;

                await Miku.sendMessage(groupJid, {
                    image: { url: poke.image },
                    caption: caption
                });

                setTimeout(() => {
                    if (global.wildPokemon.has(groupJid) && global.wildPokemon.get(groupJid).id === poke.id) {
                        global.wildPokemon.delete(groupJid);
                        Miku.sendMessage(groupJid, { text: `💨 The wild *${poke.name}* fled away!` });
                    }
                }, 120000); 
            }
        } catch (e) {
            console.error("Pokemon AutoSpawn Error:", e);
        }
    }, 300000); // 5 Minutes
}

module.exports = { startPokeAutoSpawn };