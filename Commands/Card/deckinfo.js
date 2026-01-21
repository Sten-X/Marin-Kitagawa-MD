const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");

const outputDir = path.join(__dirname, "../../lib/converted");

// Auto-create folder
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const TMP = outputDir;

function extractFrame(url, outPath) {
    return new Promise(async (resolve) => {
        try {
            const raw = outPath + "_raw";
            const writer = fs.createWriteStream(raw);
            const resp = await axios({ url, method: "GET", responseType: "stream" });
            resp.data.pipe(writer);

            writer.on("finish", () => {
                exec(`ffmpeg -y -ss 0.3 -i "${raw}" -frames:v 1 "${outPath}"`, (err) => {
                    try { fs.unlinkSync(raw); } catch {}
                    if (err) return resolve(null);
                    resolve(outPath);
                });
            });

            writer.on("error", () => resolve(null));
        } catch {
            resolve(null);
        }
    });
}

module.exports = {
    name: "deckinfo",
    alias: ["di", "listcards", "cardlist"],
    desc: "Shows your magical card list with more details 💗",
    category: "Cards",
    usage: "deckinfo <page>",
    react: "🎴",

    start: async (Miku, m, { args, prefix, pushName }) => {
        try {
            let page = parseInt(args[0]) || 1;
            const limit = 10;
            const user = m.sender;

            const userCardsDB = await mkcard.find({ owner: user });

            if (!userCardsDB.length) {
                return m.reply(
`*Awww ${pushName}-chan…*  
You don’t have any cards yet…  

✨ Try catching some cuties with:  
• *${prefix}hunt*  
• *${prefix}shop*  

I’m cheering for you~ `
                );
            }

            // Convert DB → real details
            let fullCards = userCardsDB
                .map(uc => {
                    const d = CardMgr.getCardById(uc.cardId);
                    return d ? { ...d, count: uc.count } : null;
                })
                .filter(Boolean);

            // Sort: highest tier first → alphabet
            fullCards.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            const totalCards = fullCards.length;
            const totalPages = Math.ceil(totalCards / limit);

            if (page < 1 || page > totalPages) {
                return m.reply(`😿 This page doesn’t exist~ You only have *${totalPages}* cute pages!`);
            }

            const startIndex = (page - 1) * limit;
            const pageCards = fullCards.slice(startIndex, startIndex + limit);

            // 🩷 BUILD MESSAGE
            let msg =
`〽️ *${pushName}'s Card's Deckinfo*   
━━━━━━━━━━━━━━━━━━  
🎗️ *Total Sweet Cards:* ${totalCards}  
📖 *Page:* ${page}/${totalPages}  
✨ Your collection shines so beautifully, senpai~  
━━━━━━━━━━━━━━━━━━  

`;

            pageCards.forEach((card, idx) => {
                const number = startIndex + idx + 1; // global numbering

                msg +=
`*${number}. ${card.title}*  
   🆔 ID: \`${card.id}\`  
   ✨ Tier: ${card.tier}  
   🎀 Series: ${card.series}  
   📦 Owned: x${card.count}  
${card.price ? `   💰 Value: ${card.price.toLocaleString()} Gold` : ""}
\n`;
            });

            msg +=
`━━━━━━━━━━━━━━━━━━  
🌟 *Tip:* Use *${prefix}cardinfo <Card no.>* to open a card’s full profile!  
`;

            // thumbnail extraction
            let thumb = pageCards[0].imageUrl || "";
            let preview = thumb;

            if (/\.(mp4|webm|mkv)$/i.test(thumb)) {
                const out = path.join(TMP, `thumb_${Date.now()}.jpg`);
                const frame = await extractFrame(thumb, out);
                if (frame) preview = frame;
            }

            // ⭐ BUTTONS ⭐
            let buttons = [];

            if (page > 1) {
                buttons.push({
                    buttonId: `${prefix}deckinfo ${page - 1}`,
                    buttonText: { displayText: "⬅️ Previous Page" },
                    type: 1
                });
            }

            if (page < totalPages) {
                buttons.push({
                    buttonId: `${prefix}deckinfo ${page + 1}`,
                    buttonText: { displayText: "➡️ Next Page" },
                    type: 1
                });
            }

            // Send final message
            await Miku.sendMessage(
                m.from,
                {
                    text: msg,
                    footer: `Page ${page}/${totalPages} • ${global.botName} Deck Info`,
                    buttons: buttons,
                    contextInfo: {
                        externalAdReply: {
                            title: `${pushName}'s Precious Collection`,
                            body: "Your cards look so cute today~ ",
                            mediaType: 1,
                            thumbnailUrl: preview,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );

            // Auto-delete extracted thumbnails
            if (preview && preview.includes("thumb_") && fs.existsSync(preview)) {
                fs.unlinkSync(preview);
            }

        } catch (err) {
            console.log(err);
            m.reply("❌ Aww… something went wrong while opening your cute binder.");
        }
    }
};