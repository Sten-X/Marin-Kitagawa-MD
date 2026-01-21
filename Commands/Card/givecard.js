// lib/commands/givecard.js
const fs = require("fs");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");
const { processCardMedia } = require("../../lib/converter.js"); // VIDEO + IMAGE SUPPORT

module.exports = {
    name: "givecard",
    alias: ["givcard", "giftcard", "sendcard"],
    desc: "Gift a card to another user using Deck Number or Card ID",
    category: "Cards",
    usage: "givecard <deck_number | card_id> @user",
    react: "🎁",

    start: async (Miku, m, { text, args, mentionByTag, prefix, pushName }) => {

        // Input check
        if (!args[0] || !mentionByTag[0]) {
            return m.reply(
                `🎁 *Who do you want to gift a card to, Senpai?*  

Use:
• By Number → *${prefix}givecard 1 @user*
• By ID → *${prefix}givecard cx123 @user*`
            );
        }

        const input = args[0];
        const recipient = mentionByTag[0];
        const sender = m.sender;

        if (recipient === sender)
            return m.reply("😅 Senpai... you can't gift yourself!");

        let targetCardDB = null;

        // Fetch sender's card (by Number OR ID)
        if (!isNaN(input)) {
            const index = parseInt(input) - 1;
            const userCards = await mkcard.find({ owner: sender });

            if (!userCards.length)
                return m.reply("🎒 *You don't have any cards to gift!*");

            let fullCards = userCards.map(uc => {
                const d = CardMgr.getCardById(uc.cardId);
                return d ? { ...d, db: uc } : null;
            }).filter(Boolean);

            fullCards.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            if (index < 0 || index >= fullCards.length)
                return m.reply(`❌ Invalid number! You only have *${fullCards.length}* cards.`);

            targetCardDB = fullCards[index].db;

        } else {
            targetCardDB = await mkcard.findOne({ owner: sender, cardId: input });
        }

        if (!targetCardDB)
            return m.reply("🚫 *You don't own this card!*");

        const card = CardMgr.getCardById(targetCardDB.cardId);
        if (!card) return m.reply("⚠️ Card details missing from database.");

        // Remove from sender
        if (targetCardDB.count > 1) {
            targetCardDB.count--;
            await targetCardDB.save();
        } else {
            await mkcard.deleteOne({ owner: sender, cardId: targetCardDB.cardId });
        }

        // Add to recipient
        let recCard = await mkcard.findOne({ owner: recipient, cardId: targetCardDB.cardId });
        if (recCard) {
            recCard.count++;
            await recCard.save();
        } else {
            await new mkcard({
                owner: recipient,
                cardId: targetCardDB.cardId,
                count: 1
            }).save();
        }

        const stars = "⭐".repeat(card.tier || 1);
        const attributes = card.specialAttributes?.length
            ? card.specialAttributes.join(", ")
            : "None";

        const creators = card.creators?.length
            ? card.creators.join(", ")
            : "Unknown";

        const value = card.price ? card.price.toLocaleString() : "???";

        const caption =
`🎁 *CARD GIFT SENT!* 💖✨  

Senpai, you just made someone's day so special~  

━━━━━━━━━━━━━━━━━━
👤 *From:* ${pushName}  
👤 *To:* @${recipient.split("@")[0]}  

🃏 *Card:* ${card.title}  
📺 *Series:* ${card.series}  
💎 *Tier:* ${stars}  
🎨 *Artist:* ${creators}  
🪄 *Attributes:* ${attributes}  
💼 *Base Value:* ${value}
━━━━━━━━━━━━━━━━━━

Your kindness is shining today, Senpai~ ✨`;

        const processed = await processCardMedia(card.imageUrl);
        let msg = {};
        let deleteAfter = null;

        try {
            if (processed.type === "video") {
                msg = {
                    video: { url: processed.path },
                    caption,
                    gifPlayback: true,
                    mentions: [sender, recipient],
                    footer: `${global.botName} Gift Center`,
                    buttons: [
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 My Collection" }, type: 1 },
                        { buttonId: `${prefix}cardinfo ${card.id}`, buttonText: { displayText: "📘 Card Info" }, type: 1 }
                    ]
                };

                deleteAfter = processed.path;

            } else {
                msg = {
                    image: { url: card.imageUrl },
                    caption,
                    mentions: [sender, recipient],
                    footer: `${global.botName} Gift Center`,
                    buttons: [
                        { buttonId: `${prefix}collection`, buttonText: { displayText: "🎒 My Collection" }, type: 1 },
                        { buttonId: `${prefix}cardinfo ${card.id}`, buttonText: { displayText: "📘 Card Info" }, type: 1 }
                    ]
                };
            }

            await Miku.sendMessage(m.from, msg, { quoted: m });

            // auto-delete converted mp4
            if (deleteAfter && fs.existsSync(deleteAfter)) {
                fs.unlinkSync(deleteAfter);
            }

        } catch (err) {
            console.error("Send error:", err);
            return m.reply("⚠️ Gift sent but preview failed to load.");
        }
    }
};