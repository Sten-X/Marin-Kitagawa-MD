const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { mku, mk } = require("../../Database/dataschema.js");
const fs = require("fs");
const { economy } = require("discord-mongoose-economy/models/economy.js");

module.exports = { 
    name: "leaderboard", 
    desc: "To view the leaderboard of current users", 
    alias: ["lb"],
    category: "Economy", 
    usage: "leaderboard", 
    react: "📈", 

    start: async (Miku, m,{ text, prefix, isBotAdmin, isAdmin, mentionByTag, pushName, isCreator, eco, ty }) => { 
        try { 
            let h = await eco.lb('cara', 10);

            if (!h || h.length === 0) {
                return Miku.sendMessage(m.from, { text: 'No users found on leaderboard.' }, { quoted: m });
            }

            let str = `*Top ${h.length} users with more money in wallet.*\n`;
            let arr = [];

            for (let i = 0; i < h.length; i++) {

                // Try database username
                let usernameData = await mku.findOne({ id: h[i].userID });
                let tname;

                if (usernameData && usernameData.name) {
                    tname = usernameData.name;
                } else {
                    // Safe method to get user name
                    try {
                        const cleanID = h[i].userID.split("@")[0];
                        tname = await Miku.getName(cleanID + "@s.whatsapp.net");
                    } catch {
                        // Fallback to number
                        tname = h[i].userID.split("@")[0];
                    }
                }

                str += `*${i+1}*\n╭─────────────◆\n` +
                       `│ *🎀 Name:* _${tname}_\n` +
                       `│ *⚜️ User:* _@${h[i].userID.split('@')[0]}_\n` +
                       `│ *💳 Wallet:* _${h[i].wallet}_\n` +
                       `│ *📄 Bank Amount:* _${h[i].bank}_\n` +
                       `│ *📊 Bank Capacity:* _${h[i].bankCapacity}_\n` +
                       `╰─────────────◆\n\n`;

                arr.push(h[i].userID);
            }

            return Miku.sendMessage(
                m.from,
                { text: str, mentions: arr },
                { quoted: m }
            );

        } catch (err) {
            console.log("Leaderboard Error:", err);
            return Miku.sendMessage(
                m.from,
                { text: `An internal error occurred while fetching the leaderboard.` },
                { quoted: m }
            );
        }
    }
}
