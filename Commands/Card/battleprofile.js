const fs = require("fs");
const { mkbattle } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");
const { getCardStats } = require("../../lib/battleMechanic.js");
const { processCardMedia } = require("../../lib/converter.js");

module.exports = {
    name: "battleprofile",
    alias: ["mystats"],
    desc: "Check your card battle stats",
    category: "Cards",
    usage: "card battleprofile",
    react: "📊",

    start: async (Miku, m, { prefix, pushName }) => {

        const user = m.sender;
        const profile = await mkbattle.findOne({ userId: user });
        if (!profile || !profile.mainCardId) {
            let buttons = [
                { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 Pick Fighter" }, type: 1 }
            ];
            return Miku.sendButtonText(
                m.from,
                buttons,
                `⚠️ *Battle Profile Not Found!*  

Hey ${pushName}~ 💖  
You haven't selected a main fighter yet!

Use:  
👉 *${prefix}setmain <card_id>*  
to choose your champion.`,
                `⚔️ ${global.botName} Arena`,
                m
            );
        }
        const card = CardMgr.getCardById(profile.mainCardId);
        const stats = getCardStats(card);
        const stars = "⭐".repeat(card.tier);

        // More detailed metrics
        const dps = (stats.atk / 1.2).toFixed(1);
        const survivability = (stats.def + stats.maxHp / 10).toFixed(0);
        let rank = "🥚 Novice Hatchling";
        if (profile.elo > 1200) rank = "🐤 Rookie Warrior";
        if (profile.elo > 1500) rank = "🦅 Skilled Duelist";
        if (profile.elo > 2000) rank = "🐉 Elite Champion";
        if (profile.elo > 3000) rank = "🔥 Mythic Warlord";
        if (profile.elo > 4000) rank = "👑 Eternal Godslayer";
        let txt =
`🌸 *Battle Profile — ${pushName}* 🌸  

⚔️ *Main Fighter:*  
${card.title}  (${stars})

📋 *Battle Stats*  
• ATK: ${stats.atk}  
• DEF: ${stats.def}  
• HP:  ${stats.maxHp}  
• DPS: ${dps}  
• Survival Score: ${survivability}

🏆 *Rank:* ${rank}  
📈 ELO: *${profile.elo}*  

🥇 Wins: *${profile.wins}*  
💀 Losses: *${profile.losses}*  

✨ Train hard, warrior. Glory awaits you in the arena!`;

        const processedMedia = await processCardMedia(card.imageUrl);

        let messageObj = {};
        let deleteAfter = null;

        try {
            if (processedMedia.type === "video") {
                messageObj = {
                    video: { url: processedMedia.path },
                    caption: txt,
                    gifPlayback: true,
                    footer: `⚔️ ${global.botName} Arena`,
                    buttons: [
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 Change Fighter" }, type: 1 }
                    ]
                };

                deleteAfter = processedMedia.path;

            } else {
                messageObj = {
                    image: { url: card.imageUrl },
                    caption: txt,
                    footer: `⚔️ ${global.botName} Arena`,
                    buttons: [
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 Change Fighter" }, type: 1 }
                    ]
                };
            }

            await Miku.sendMessage(m.from, messageObj, { quoted: m });

            // Auto-delete converted MP4
            if (deleteAfter && fs.existsSync(deleteAfter)) {
                fs.unlinkSync(deleteAfter);
                console.log("Auto-deleted battleprofile MP4:", deleteAfter);
            }

        } catch (err) {
            console.error("battleprofile send error:", err);
            return m.reply("⚠️ Failed to load your fighter preview.");
        }
    }
};