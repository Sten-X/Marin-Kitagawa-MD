const fs = require("fs");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");
// Converter Import (Ensure lib/converter.js is the one with CROP logic)
const { processCardMedia } = require("../../lib/converter.js"); 

module.exports = {
    name: "cardinfo",
    alias: ["ci", "view", "inspect", "checkcard"],
    desc: "View card details by Deck Number, Name or ID (Deck Style)",
    category: "Cards",
    usage: "cardinfo <number | name | id>",
    react: "🔍",

    start: async (Miku, m, { text, args, prefix }) => {

        if (!text)
            return m.reply(
`🧐 *Which card do you want to inspect?*

Examples:
• *${prefix}cardinfo 1* → From your collection  
• *${prefix}cardinfo Goku* → Search by name  
• *${prefix}cardinfo cx123* → By ID`
            );

        const user = m.sender;
        let targetCard = null;

        // --- 1. SEARCH BY NUMBER ---
        if (!isNaN(args[0]) && args.length === 1) {
            const index = parseInt(args[0]) - 1;
            const userCards = await mkcard.find({ owner: user });

            if (!userCards.length)
                return m.reply("🎒 Your collection is empty!");

            let fullCards = userCards
                .map(uc => {
                    const d = CardMgr.getCardById(uc.cardId);
                    return d ? { ...d, dbData: uc } : null;
                })
                .filter(Boolean);

            // Sorting (Same as Collection)
            fullCards.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            if (index < 0 || index >= fullCards.length)
                return m.reply(`❌ Invalid number! You only own *${fullCards.length}* cards.`);

            targetCard = fullCards[index];
        }

        // --- 2. SEARCH BY NAME/ID ---
        else {
            let cardData = CardMgr.getCardById(text);
            if (!cardData) cardData = CardMgr.getCardByName(text);

            if (!cardData)
                return m.reply("❌ Card not found!");

            const userOwn = await mkcard.findOne({ owner: user, cardId: cardData.id });

            if (userOwn)
                targetCard = { ...cardData, dbData: userOwn };
            else
                targetCard = { ...cardData, dbData: { count: 0, obtainedAt: null } };
        }

        // --- 3. PREPARE DATA ---
        if (!targetCard) return m.reply("⚠️ Error loading card data.");

        const c = targetCard;
        const count = c.dbData.count || 0;
        const obtainedAt = c.dbData.obtainedAt
            ? new Date(c.dbData.obtainedAt).toDateString()
            : "Not Owned";

        const stars = "⭐".repeat(c.tier);
        const attributes = c.specialAttributes?.length
            ? c.specialAttributes.join(", ")
            : "None";

        let infoMsg =
`✨ *CARD INSPECTION* ✨

🃏 *${c.title}*
📺 *Series:* ${c.series}

🔰 *Rarity:* ${stars}
🆔 *Card ID:* \`${c.id}\`

📦 *Your Inventory:* • Copies Owned: *${count}* • First Obtained: *${obtainedAt}*

💰 *Market Value:* ${c.price.toLocaleString()} Gold  
❤️ *Wishlisted By:* ${c.wantCount} users  
🪄 *Attributes:* ${attributes}
`;

        // Buttons
        let buttons = [];
        if (count > 0) {
            buttons.push({ buttonId: `${prefix}sellcard ${c.id}`, buttonText: { displayText: "💸 Sell" }, type: 1 });
            buttons.push({ buttonId: `${prefix}setcard ${c.id}`, buttonText: { displayText: "🛡️ Set as Main" }, type: 1 });
        } else {
            buttons.push({ buttonId: `${prefix}market`, buttonText: { displayText: "🛍️ Browse Market" }, type: 1 });
        }

        // --- 4. PROCESS MEDIA (Deck Style) ---
        // Ye function 'converter.js' use karega jisme humne CROP logic lagaya tha
        const processed = await processCardMedia(c.imageUrl);
        let deleteAfter = null;

        try {
            if (processed.type === "video") {
                // Video Card (WebM -> MP4 with Perfect Crop)
                await Miku.sendMessage(
                    m.from,
                    {
                        // File Buffer read karke bhejo (More Reliable)
                        video: fs.readFileSync(processed.path), 
                        caption: infoMsg,
                        gifPlayback: true, // Loop like GIF
                        buttons,
                        footer: `${global.botName} Card Info`
                    },
                    { quoted: m }
                );
                deleteAfter = processed.path;

            } else {
                // Normal Image Card
                await Miku.sendMessage(
                    m.from,
                    {
                        image: { url: processed.url || c.imageUrl },
                        caption: infoMsg,
                        buttons,
                        footer: `${global.botName} Card Info`
                    },
                    { quoted: m }
                );
            }
        } catch (err) {
            console.log("CardInfo Media Error:", err);
            m.reply("⚠️ Failed to load card image.");
        } finally {
            // CLEANUP: Delete temp video file
            if (deleteAfter && fs.existsSync(deleteAfter)) {
                fs.unlinkSync(deleteAfter);
            }
        }
    }
};