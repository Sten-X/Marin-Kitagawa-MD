const { mkcard, mku } = require("../../Database/dataschema.js");

module.exports = {
    name: "lbcard",
    alias: ["topcards", "clb"],
    desc: "See top card collectors",
    category: "Cards",
    usage: "cardlb",
    react: "🏆",
    start: async (Miku, m, { prefix }) => {
        // 1. Database se count nikalo
        const cardlb = await mkcard.aggregate([
            {
                $group: {
                    _id: "$owner",
                    totalCards: { $sum: "$count" }
                }
            },
            { $sort: { totalCards: -1 } }, // Sabse zyada cards wale upar
            { $limit: 10 } // Top 10
        ]);

        if (cardlb.length < 1) {
            return m.reply("No one has collected any cards yet! Be the first Senpai! 🥇");
        }

        let text = `🏆 *Card Collectors cardlb* 🏆\n\nWho is the ultimate Otaku?\n\n`;
        
        // 2. Loop through Top 10 Users
        for (let i = 0; i < cardlb.length; i++) {
            let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `*${i + 1}.*`;
            
            let name = "Unknown User";
            const userId = cardlb[i]._id;

            try {
                // FIX: Pehle Miku.getName try karega (WhatsApp Contact Name)
                // Agar wo fail hua to Database check karega
                // Agar wo bhi fail hua to Phone Number dikhayega
                
                if (Miku.getName) {
                    name = await Miku.getName(userId);
                } else {
                    // Fallback to Database if Miku.getName is not available
                    let userDb = await mku.findOne({ id: userId });
                    if (userDb && userDb.name) {
                        name = userDb.name;
                    } else {
                        // Fallback to Phone Number
                        name = userId.split('@')[0];
                    }
                }
            } catch (e) {
                name = userId.split('@')[0]; // Error aane par number dikhao
            }

            text += `${medal} *${name}* : ${cardlb[i].totalCards} Cards 🃏\n`;
        }

        text += `\n\nKeep collecting Senpai! Ganbatte! 💪✨`;

        // 3. Buttons Add Kiye
        let buttons = [
            {
                buttonId: `${prefix}collection`,
                buttonText: { displayText: "🎒 My Collection" },
                type: 1,
            }
        ];

        let buttonMessage = {
            image: { url: botImage1 },
            caption: text,
            footer: `*${botName}*`, // Global BotName
            buttons: buttons,
            type: 4
        };

        await Miku.sendMessage(m.from, buttonMessage, { quoted: m });
    }
};