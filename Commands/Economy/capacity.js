const fs = require("fs");

module.exports = {

    name: "capacity",
    alias: ["bankupgrade", "upgradebank"],
    desc: "Upgrade your bank storage capacity ❤️",
    category: "Economy",
    react: "📊",

    start: async (Miku, m, { text, prefix, pushName, eco }) => {

        const user = m.sender;
        const cara = "cara";

        const bal = await eco.balance(user, cara);

        // No option selected
        if (!text) {
            return m.reply(
`🏦 *${global.botName} Bank Capacity Upgrades* 💗

✨ *Choose your upgrade Senpai~*

1️⃣  *+ 1,000 Capacity*  
    💵 Cost: 100 💎  

2️⃣  *+ 100,000 Capacity*  
    💵 Cost: 1,000 💎  

3️⃣  *+ 10,000,000 Capacity*  
    💵 Cost: 10,000 💎  

📝 *Example:*  
• ${prefix}capacity 1  
• ${prefix}capacity 2  
• ${prefix}capacity 3  

Let me upgrade your vault nya~ 🐾💕`
            );
        }

        let opt = text.trim();

        // OPTIONS CONFIG
        const upgrades = {
            "1": { cost: 100, addCap: 1000 },
            "2": { cost: 10000, addCap: 100000 },
            "3": { cost: 1000000, addCap: 10000000 }
        };

        // Validate option
        if (!upgrades[opt]) {
            return m.reply("❌ Senpai, choose a valid option: 1, 2, or 3 💞");
        }

        const choice = upgrades[opt];

        // Not enough money
        if (bal.wallet < choice.cost) {
            return m.reply(
`😿 *Aww Senpai... You don’t have enough money!*  
You need *${choice.cost.toLocaleString()} 💎* to upgrade your bank.

👛 *Your Wallet:* ${bal.wallet.toLocaleString()}`
            );
        }

        // Deduct money
        await eco.deduct(user, cara, choice.cost);

        // Add bank capacity
        const upgraded = await eco.giveCapacity(user, cara, choice.addCap);

        // Final info
        return Miku.sendMessage(
            m.from,
            {
                image: fs.readFileSync("./Assets/Img/card2.png"),
                caption:
`📊 *Bank Capacity Upgraded Successfully!* 💗

🎉 *Congratulations, ${pushName} Senpai!*  
Your vault just got *bigger and stronger*, nya~ ✨

💵 *Cost Paid:* ${choice.cost.toLocaleString()} 💎  
📦 *Capacity Increased By:* ${choice.addCap.toLocaleString()}  

🏦 *New Total Capacity:* ${upgraded.after.toLocaleString()}  

Keep upgrading your vault and become a rich Senpai! 💖`,
                footer: `*© ${global.botName} Your Bank Upgrade Assistant*`,
            },
            { quoted: m }
        );
    }
};