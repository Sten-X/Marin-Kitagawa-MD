const fs = require("fs");
// mkcard add kiya taaki collection fetch kar sakein
const { mkbattle, mkcard } = require("../../Database/dataschema.js"); 
const CardMgr = require("../../lib/cardManager.js");
const { getCardStats } = require("../../lib/battleMechanic.js");
const { processCardMedia } = require("../../lib/converter.js"); 

module.exports = {
    name: "cardbattle",
    alias: ["fight", "duel", "cb"],
    desc: "Fight another user using Deck Number or Main Card",
    category: "Cards",
    usage: "battle <number> @user",
    react: "⚔️",

    start: async (Miku, m, { args, mentionByTag, eco, prefix, pushName }) => {
        
        // 1. Tag Check
        if (!mentionByTag[0])
            return m.reply(`⚔️ *Tag someone to battle!*\n\nUsage:\n1. With Specific Card: *${prefix}battle 1 @user*\n2. With Main Card: *${prefix}battle @user*`);

        const player1 = m.sender;
        const player2 = mentionByTag[0];

        if (player1 === player2)
            return m.reply("🛑 You cannot battle yourself, silly!");

        // 2. Fetch Profiles (Elo/Stats update karne ke liye ye zaroori hai)
        let p1Profile = await mkbattle.findOne({ userId: player1 });
        let p2Profile = await mkbattle.findOne({ userId: player2 });

        // Agar profile nahi hai to create karo
        if (!p1Profile) p1Profile = new mkbattle({ userId: player1 });
        if (!p2Profile) p2Profile = new mkbattle({ userId: player2 });

        let p1CardData = null;
        let p2CardData = null;
        if (args[0] && !isNaN(args[0])) {
            const index = parseInt(args[0]) - 1; // 0-based index

            // Fetch User Collection
            const userCardsDB = await mkcard.find({ owner: player1 });
            if (!userCardsDB || userCardsDB.length === 0) return m.reply("🎒 Your deck is empty! Go collect some cards first.");

            // Map & Sort (Must match Collection Command Sorting)
            let fullCards = userCardsDB.map(uc => {
                const details = CardMgr.getCardById(uc.cardId);
                return details ? { ...details, dbData: uc } : null;
            }).filter(c => c !== null);

            // Sorting: Tier Descending -> Alphabetical
            fullCards.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            // Validate Index
            if (index < 0 || index >= fullCards.length) {
                return m.reply(`❌ Invalid Number! You only have *${fullCards.length}* cards.`);
            }

            p1CardData = fullCards[index]; // Selected Card

        } else {
            // Default: Use Main Card
            if (!p1Profile.mainCardId) {
                return m.reply(`⚠️ You haven't selected a specific card AND you don't have a Main Card set!\n\nUse *${prefix}battle <number> @user* OR set a main card with *${prefix}setmain*.`);
            }
            p1CardData = CardMgr.getCardById(p1Profile.mainCardId);
        }
        
        if (!p2Profile.mainCardId) {
            return m.reply(`⚠️ The opponent (@${player2.split('@')[0]}) doesn't have a Main Card set yet! They need to use *${prefix}setmain* first.`);
        }
        p2CardData = CardMgr.getCardById(p2Profile.mainCardId);

        // Validation
        if (!p1CardData) return m.reply("❌ Error: Player 1 Card data not found.");
        if (!p2CardData) return m.reply("❌ Error: Opponent's Main Card data missing.");

        let s1 = getCardStats(p1CardData);
        let s2 = getCardStats(p2CardData);

        // Fancy battle intro
        let log =
`⚔️ *BATTLE ARENA* ⚔️  

🤖 *P1:* ${p1CardData.title} (HP: ${s1.hp})
🆚
👹 *P2:* ${p2CardData.title} (HP: ${s2.hp})

━━━━━━━━━━━━━━━━━━\n`;

        let turn = 0;
        let winner = null;
        let p1Winner = false;

        // Loop runs max 10 rounds to prevent spam
        while (s1.hp > 0 && s2.hp > 0 && turn < 10) {
            turn++;

            // Critical or miss chance
            const crit1 = Math.random() < 0.15;
            const crit2 = Math.random() < 0.15;
            const miss1 = Math.random() < 0.07;
            const miss2 = Math.random() < 0.07;

            // Damage calculations
            let dmg1 = miss1 ? 0 : Math.max(10, Math.floor((s1.atk * (crit1 ? 1.8 : 1)) - (s2.def * 0.5) + Math.random() * 20));
            let dmg2 = miss2 ? 0 : Math.max(10, Math.floor((s2.atk * (crit2 ? 1.8 : 1)) - (s1.def * 0.5) + Math.random() * 20));

            s2.hp -= dmg1;
            if (s2.hp > 0) s1.hp -= dmg2; // P2 attacks back only if alive

            // Log
            log += `🔹 *R${turn}*: `;
            log += `${p1CardData.title} hits ${dmg1}${crit1?"💥":""} | `;
            log += `${p2CardData.title} hits ${dmg2}${crit2?"💥":""}\n`;
        }
        
        let prize = 500;

        // Result Handling
        if (s1.hp > s2.hp) {
            // Player 1 Wins
            p1Winner = true;
            log += `\n🏆 *WINNER:* ${p1CardData.title} \n❤️ HP Left: ${Math.max(s1.hp, 0)}`;

            p1Profile.wins++;
            p1Profile.elo += 25;
            p2Profile.losses++;
            p2Profile.elo = Math.max(0, p2Profile.elo - 20);

            await eco.give(player1, "cara", prize);

        } else {
            // Player 2 Wins
            log += `\n🏆 *WINNER:* ${p2CardData.title} \n💙 HP Left: ${Math.max(s2.hp, 0)}`;

            p2Profile.wins++;
            p2Profile.elo += 25;
            p1Profile.losses++;
            p1Profile.elo = Math.max(0, p1Profile.elo - 20);

            await eco.give(player2, "cara", prize);
        }

        // Save Stats
        await p1Profile.save();
        await p2Profile.save();

        log += `\n\n💰 Winner earns: *${prize} Gold*`;
        
        const winImg = p1Winner ? p1CardData.imageUrl : p2CardData.imageUrl;
        const processed = await processCardMedia(winImg);

        let deleteAfter = null;
        const buttons = [
            { buttonId: `${prefix}battleprofile`, buttonText: { displayText: "📊 Stats" }, type: 1 },
            { buttonId: `${prefix}battle ${args[0] || ""} @${player2.split("@")[0]}`, buttonText: { displayText: "🔁 Rematch" }, type: 1 }
        ];

        let msg = {};

        if (processed.type === "video") {
            msg = {
                video: { url: processed.path }, // Send local MP4 path
                caption: log,
                gifPlayback: true,
                footer: `⚔️ ${global.botName} Arena`,
                buttons,
                mentions: [player2]
            };
            // Set deletion path
            if (processed.path && fs.existsSync(processed.path)) {
                deleteAfter = processed.path;
            }

        } else {
            msg = {
                image: { url: winImg }, // Use original URL for images
                caption: log,
                footer: `⚔️ ${global.botName} Arena`,
                buttons,
                mentions: [player2]
            };
        }

        // Send
        await Miku.sendMessage(m.from, msg, { quoted: m });

        // Cleanup MP4 if created
        if (deleteAfter) {
            try { fs.unlinkSync(deleteAfter); } catch(e) {}
        }
    }
};