// lib/commands/sellcard.js
const fs = require("fs");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");
const { processCardMedia } = require("../../lib/converter.js"); // MP4 + IMAGE SUPPORT

module.exports = {
    name: "sellcard",
    alias: ["sc", "sell"],
    desc: "Sell a card to the system for Gold",
    category: "Cards",
    usage: "sellcard <number | id>",
    react: "💸",

    start: async (Miku, m, { args, eco, prefix, pushName }) => {

        if (!args[0]) {
            return m.reply(
                `💸 *Which card do you want to sell, Senpai?*  
Use:  
• By Number → *${prefix}sellcard 1*  
• By ID → *${prefix}sellcard cx123*`
            );
        }

        const input = args[0];
        const sender = m.sender;
        let targetCardDB = null;

        if (!isNaN(input)) {
            const index = parseInt(input) - 1;

            let userCards = await mkcard.find({ owner: sender });
            if (!userCards.length)
                return m.reply("🎒 *Your deck is empty, Senpai!*");

            // Map + sort to match collection order
            let sorted = userCards.map(uc => {
                const d = CardMgr.getCardById(uc.cardId);
                return d ? { ...d, db: uc } : null;
            }).filter(Boolean);

            sorted.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            if (index < 0 || index >= sorted.length)
                return m.reply(`❌ *Invalid number!* You only have *${sorted.length}* cards.`);

            targetCardDB = sorted[index].db;

        } else {
            targetCardDB = await mkcard.findOne({ owner: sender, cardId: input });
        }

        if (!targetCardDB)
            return m.reply("🚫 *You don’t own this card, Senpai!*");

        const card = CardMgr.getCardById(targetCardDB.cardId);
        if (!card)
            return m.reply("⚠️ Card details missing from database.");

        const baseValue = card.price || 500;
        const sellPrice = Math.floor(baseValue * 0.5); // System gives 50%
        if (targetCardDB.count > 1) {
            targetCardDB.count--;
            await targetCardDB.save();
        } else {
            await mkcard.deleteOne({ _id: targetCardDB._id });
        }

        await eco.give(sender, "cara", sellPrice);
        const stars = "⭐".repeat(card.tier || 1);
        const attributes = card.specialAttributes?.length
            ? card.specialAttributes.join(", ")
            : "None";
        const creators = card.creators?.length
            ? card.creators.join(", ")
            : "Unknown";
        const caption =
`💸 *CARD SOLD SUCCESSFULLY!*  

Good job, Senpai! You made some shiny gold! ✨  

━━━━━━━━━━━━━━━━━━
🃏 *Card:* ${card.title}  
📺 *Series:* ${card.series}  
💎 *Tier:* ${stars}  
🎨 *Artist:* ${creators}  
🪄 *Attributes:* ${attributes}  
💰 *System Payout:* ${sellPrice.toLocaleString()} Gold  
📉 *Base Value:* ${baseValue.toLocaleString()}
━━━━━━━━━━━━━━━━━━

Your card has been exchanged for gold in the System Shop!  
Keep building your dream deck~ 💖`;

        const processed = await processCardMedia(card.imageUrl);
        let msg = {};
        let deleteAfter = null;

        try {
            if (processed.type === "video") {
                msg = {
                    video: { url: processed.path },
                    caption,
                    gifPlayback: true,
                    footer: `${global.botName} Pawn Shop`,
                    buttons: [
                        { buttonId: `${prefix}wallet`, buttonText: { displayText: "💰 Wallet" }, type: 1 },
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 My Collection" }, type: 1 }
                    ]
                };

                deleteAfter = processed.path;

            } else {
                msg = {
                    image: { url: card.imageUrl },
                    caption,
                    footer: `${global.botName} Pawn Shop`,
                    buttons: [
                        { buttonId: `${prefix}wallet`, buttonText: { displayText: "💰 Wallet" }, type: 1 },
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 My Collection" }, type: 1 }
                    ]
                };
            }

            await Miku.sendMessage(m.from, msg, { quoted: m });

            if (deleteAfter && fs.existsSync(deleteAfter))
                fs.unlinkSync(deleteAfter);

        } catch (err) {
            console.error("Send Error in sellcard:", err);
            return m.reply("⚠️ Card sold, but preview failed to send.");
        }
    }
};