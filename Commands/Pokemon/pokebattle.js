const { mkpokemon, mkbattle } = require("../../Database/dataschema.js");
const { getPokemon } = require("../../lib/pokeGame.js");

// Temporary Memory for Challenges
if (!global.pokeChallenges) global.pokeChallenges = new Map();

module.exports = {
    name: "pokemonbattle",
    alias: ["pokebattle"],
    desc: "Challenge a user to a Pokemon Battle",
    category: "Pokemon",
    usage: "pokebattle @user | pokebattle accept",
    react: "⚔️",
    start: async (Miku, m, { args, mentionByTag, eco, prefix, pushName }) => {
        
        // --- HELPER: GET BUDDY ONLY (No Fallback) ---
        // Ye function check karega ki Main Pokemon set hai ya nahi
        const getBuddy = async (userId) => {
            const profile = await mkbattle.findOne({ userId: userId });
            if (profile && profile.mainPokeId) {
                const buddy = await mkpokemon.findOne({ _id: profile.mainPokeId });
                return buddy;
            }
            return null; // Agar set nahi hai to null return karega
        };

        // ====================================================
        // 1. ACCEPT LOGIC
        // ====================================================
        if (args[0] === "accept" || args[0] === "yes") {
            const challenge = global.pokeChallenges.get(m.sender);
            
            if (!challenge) {
                return m.reply("❌ You don't have any pending challenges!");
            }

            // 🛑 CHECK: Kya Accepter ne Buddy set kiya hai?
            const p2 = await getBuddy(m.sender);
            if (!p2) {
                return m.reply(`🛑 *Wait!* You haven't chosen your fighter yet!\n\nUse *${prefix}setpoke <pokemon_name>* first!`);
            }

            const player1 = challenge.challenger;
            const player2 = m.sender;

            // 🛑 CHECK: Kya Challenger ka Buddy abhi bhi valid hai?
            const p1 = await getBuddy(player1);
            if (!p1) {
                global.pokeChallenges.delete(m.sender);
                return m.reply("⚠️ Battle Cancelled! The challenger changed or removed their Main Pokemon.");
            }

            // Clear Challenge
            global.pokeChallenges.delete(m.sender);

            // --- BATTLE START ---
            const p1Data = await getPokemon(p1.pokeId);
            const p2Data = await getPokemon(p2.pokeId);

            // Stats Calculation (HP Boost + Level)
            let hp1 = p1Data.hp * (p1.level / 2) + (p1.maxHp - 100); 
            let atk1 = p1Data.atk * (p1.level / 2);
            let hp2 = p2Data.hp * (p2.level / 2) + (p2.maxHp - 100);
            let atk2 = p2Data.atk * (p2.level / 2);

            let log = `⚔️ *BATTLE STARTED!* ⚔️\n\n` +
                      `🔴 *${p1.name}* (Lvl ${p1.level}) vs 🔵 *${p2.name}* (Lvl ${p2.level})\n\n`;

            let turn = 0;
            while (hp1 > 0 && hp2 > 0 && turn < 10) {
                turn++;
                // P1 Attacks
                let dmg1 = Math.floor(atk1 * 0.4 + Math.random() * 20);
                hp2 -= dmg1;
                // P2 Attacks
                let dmg2 = Math.floor(atk2 * 0.4 + Math.random() * 20);
                hp1 -= dmg2;
            }

            // Winner Logic
            let winnerText = "";
            let reward = 200;

            if (hp1 > hp2) {
                winnerText = `🏆 *Winner:* ${p1.name} (Challenger)\n`;
                if (Math.random() > 0.5) {
                    p1.level += 1;
                    p1.exp += 50;
                    await p1.save();
                    winnerText += `🆙 *${p1.name} leveled up to ${p1.level}!*`;
                }
                await eco.give(player1, "cara", reward);
            } else {
                winnerText = `🏆 *Winner:* ${p2.name} (Defender)\n`;
                await eco.give(player2, "cara", reward);
            }

            return Miku.sendMessage(m.from, {
                image: {url : botImage6},
                caption: log + winnerText + `\n\n💰 Winner earned ${reward} Gold!`,
                mentions: [player1, player2],
                footer: `*${global.botName} Arena*`,
                type: 4
            }, { quoted: m });
        }

        // ====================================================
        // 2. REJECT LOGIC
        // ====================================================
        if (args[0] === "reject" || args[0] === "no") {
            if (global.pokeChallenges.has(m.sender)) {
                global.pokeChallenges.delete(m.sender);
                return m.reply("❌ Challenge Rejected!");
            }
            return m.reply("You have no challenges to reject.");
        }

        // ====================================================
        // 3. CHALLENGE LOGIC (Initiate)
        // ====================================================
        if (!mentionByTag[0]) return m.reply(`Tag someone to challenge! ⚔️\nUsage: *${prefix}pokebattle @user*`);

        const opponent = mentionByTag[0];
        const challenger = m.sender;

        if (opponent === challenger) return m.reply("🛑 You can't battle yourself!");

        // 🛑 CHECK: Kya Challenger ne Buddy set kiya hai?
        const p1 = await getBuddy(challenger);
        if (!p1) {
            return m.reply(`🛑 *Access Denied!* \n\nYou haven't set a Main Pokémon yet!\nUse *${prefix}setpoke <name>* to choose your fighter.`);
        }

        // Check Opponent (Optional: You can let them know opponent is weak, or just send challenge)
        // Hum challenge bhej denge, lekin accept karte waqt opponent ko set karna padega

        // Store Challenge
        global.pokeChallenges.set(opponent, {
            challenger: challenger,
            pokeName: p1.name
        });

        // Timeout
        setTimeout(() => {
            if (global.pokeChallenges.has(opponent)) {
                global.pokeChallenges.delete(opponent);
            }
        }, 60000);

        // Buttons
        let buttons = [
            { buttonId: `${prefix}pokebattle accept`, buttonText: { displayText: "✅ Accept" }, type: 1 },
            { buttonId: `${prefix}pokebattle reject`, buttonText: { displayText: "❌ Reject" }, type: 1 }
        ];

        let msg = `⚔️ *POKEMON BATTLE REQUEST* ⚔️\n\n` +
                  `Hey @${opponent.split('@')[0]}! 👋\n` +
                  `*${pushName}* wants to battle you!\n\n` +
                  `🔴 *Attacker:* ${p1.name} (Lvl ${p1.level})\n\n` +
                  `_Do you accept? (Make sure you have set your buddy!)_`;

        await Miku.sendMessage(m.from, {
            text: msg,
            footer: `*${global.botName} Arena*`,
            buttons: buttons,
            mentions: [opponent],
            headerType: 1
        }, { quoted: m });
    }
};