const fs = require("fs");

module.exports = {
    name: "daily",
    alias: ["reward", "claimdaily"],
    desc: "Claim your daily gold reward 💝",
    category: "Economy",
    react: "💷",

    start: async (Miku, m, { prefix, pushName, eco }) => {

        // Only for groups
        if (!m.isGroup) {
            return m.reply("⚠️ *Senpai~ this command works only inside groups!* 💕");
        }

        const user = m.sender;
        const cara = "cara";

        // Daily reward (adjustable)
        const rewardAmount = 100000; // recommended: 500–20,000

        // Claim daily
        const daily = await eco.daily(user, cara, rewardAmount);

        // Already claimed ❌
        if (daily.cd) {

            // Format cooldown time
            const timeLeft = daily.cdL || "a few hours";

            let buttons = [
                { buttonId: `${prefix}wallet`, buttonText: { displayText: "👛 Wallet" }, type: 1 },
                { buttonId: `${prefix}bank`, buttonText: { displayText: "🏦 Bank" }, type: 1 }
            ];

            return Miku.sendMessage(
                m.from,
                {
                    image: fs.readFileSync("./Assets/Img/card.png"),
                    caption:
`🧧 *Daily Reward Already Claimed, ${pushName} Senpai!*  

Come back again after:  
⏳ *${timeLeft}*

I’ll be waiting to give you more gold nya~ 💗✨`,
                    footer: `*© ${global.botName} | Your Rewards*`,
                    buttons,
                    type: 4,
                },
                { quoted: m }
            );
        }

        // Successful daily claim ✔
        const amount = daily.amount || rewardAmount;

        let buttons = [
            { buttonId: `${prefix}wallet`, buttonText: { displayText: "💳 Wallet" }, type: 1 },
            { buttonId: `${prefix}bank`, buttonText: { displayText: "🏦 Bank" }, type: 1 },
        ];

        return Miku.sendMessage(
            m.from,
            {
                image: fs.readFileSync("./Assets/Img/card.png"),
                caption:
`🎉 *Daily Reward Collected, ${pushName} Senpai!* 💝

✨ You received:  
💴 *${amount.toLocaleString()} Gold*

Keep checking in daily for more rewards nya~ `,
                footer: `© ${global.botName} Rewards System`,
                buttons,
                type: 4,
            },
            { quoted: m }
        );
    }
};