const axios = require("axios");

// Random ID Generator
const getRandomPokeID = () => Math.floor(Math.random() * 898) + 1;

// Shiny Chance (1%)
const isShiny = () => Math.random() < 0.01; 

const getPokemon = async (id) => {
    try {
        // 1. Basic Data Fetch
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
        const { data } = await axios.get(url);
        
        // 2. Species Data Fetch (For Description & Gen)
        const speciesUrl = data.species.url;
        const speciesData = await axios.get(speciesUrl);
        
        // --- DATA PROCESSING ---

        // Name
        const pokeName = data.name.charAt(0).toUpperCase() + data.name.slice(1);

        // Types
        const pokeTypes = data.types.map(t => t.type.name.toUpperCase()).join(" | ");

        // Abilities
        const abilities = data.abilities.map(a => a.ability.name).join(", ");

        // Generation (e.g., "generation-i" -> "Gen 1")
        let gen = speciesData.data.generation.name.split("-")[1].toUpperCase();

        // Description (Flavor Text) - English wala dhundo
        let description = speciesData.data.flavor_text_entries.find(entry => entry.language.name === "en")?.flavor_text || "No description available.";
        
        // Description clean karo (newlines hatao)
        description = description.replace(/[\n\f\r]/g, " ");

        // Description me se Pokemon ka naam chupao (Spoiler prevention)
        const nameRegex = new RegExp(pokeName, "gi");
        description = description.replace(nameRegex, "???");

        // Shiny Logic
        const shinyStatus = isShiny();
        let image = data.sprites.other["official-artwork"].front_default;
        if (shinyStatus) image = data.sprites.other["official-artwork"].front_shiny;
        if (!image) image = data.sprites.front_default;

        return {
            id: data.id,
            name: pokeName,
            type: pokeTypes,
            abilities: abilities,
            gen: gen,
            desc: description,
            hp: data.stats[0].base_stat,
            atk: data.stats[1].base_stat,
            def: data.stats[2].base_stat,
            spd: data.stats[5].base_stat,
            image: image,
            isShiny: shinyStatus
        };

    } catch (e) {
        console.error(`[PokeGame] Error fetching ID ${id}:`, e.message);
        return null;
    }
};

module.exports = { getPokemon, getRandomPokeID };