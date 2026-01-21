const fs = require("fs");
const path = require("path");

module.exports = {
    name: "bank",
    desc: "Shows bank information",
    alias: ["bank"],
    category: "Economy",
    react: "🏦",

    start: async (Miku, m, { prefix, pushName, eco }) => {

        const user = m.sender;
        const cara = "cara";

        // Fetch balance safely
        const bal = await eco.balance(user, cara);

        const bank = bal.bank ?? 0;
        const cap = bal.bankCapacity ?? 100000;
        const wallet = bal.wallet ?? 0;

        // Wealth rank logic
        let rank = "Brokie 😭";

        if (bank > 1000) rank = "Poor 😢";
        if (bank > 10000) rank = "Average 💸";
        if (bank > 50000) rank = "Rich 💰💎";
        if (bank > 1000000) rank = "Millionaire 🤑";
        if (bank > 10000000) rank = "Billionaire 🤑🤑";
        if (bank > 100000000) rank = "World Boss 👑🌍";

        // Capacity Progress
        const percent = ((bank / cap) * 100).toFixed(1);

        // Buttons
        let buttons = [
            {
                buttonId: `${prefix}wallet`,
                buttonText: { displayText: "👛 Wallet" },
                type: 1,
            },
            {
                buttonId: `${prefix}deposit`,
                buttonText: { displayText: "📥 Deposit" },
                type: 1,
            },
            {
                buttonId: `${prefix}withdraw`,
                buttonText: { displayText: "💸 Withdraw" },
                type: 1,
            },
        ];

        return Miku.sendMessage(
            m.from,
            {
                image: fs.readFileSync("./Assets/Img/card2.png"),
                caption:
` *Hello ${pushName} Senpai~ Welcome to ${global.botName} Bank!* 🏦

✨ Here is your cute little bank summary:

💰 *Bank Balance:*  
➡ ${bank.toLocaleString()} / ${cap.toLocaleString()}  
🔋 *Capacity Used:* ${percent}%  

👛 *Wallet:*  
➡ ${wallet.toLocaleString()}  

👑 *Wealth Rank:*  
➡ ${rank}

Keep saving Senpai~ One day you will become a billionaire `,
                footer: `*© ${global.botName} | Your Banking Assistant*`,
                buttons,
                type: 4,
            },
            { quoted: m }
        );
    },
};