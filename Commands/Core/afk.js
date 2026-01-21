const { mku } = require("../../Database/dataschema.js");

module.exports = {
    name: "afk",
    alias: ["busy", "away"],
    desc: "Set yourself as Away From Keyboard",
    category: "Core",
    usage: "afk <reason>",
    react: "💤",
    start: async (Miku, m, { text, pushName }) => {
        const reason = text || "Just relaxing...";

        // Update Database
        await mku.updateOne({ id: m.sender }, { afk: "true", afkReason: reason });

        m.reply(`💤 *AFK Mode Activated* 💤\n\nUser: *${pushName}*\nReason: *${reason}*\n\nI will tell anyone who tags you that you are busy! 🤫`);
    }
};