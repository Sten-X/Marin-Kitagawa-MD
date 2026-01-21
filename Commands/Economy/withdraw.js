const eco = require("discord-mongoose-economy");

module.exports = {
    name: "withdraw",
    alias: ["with", "wd", "cashout"],
    desc: "Withdraw money from your Bank into Wallet",
    category: "Economy",
    usage: "withdraw <amount> | withdraw all",
    react: "💸",

    start: async (Miku, m, { text, prefix, pushName }) => {

        const user = m.sender;
        const cara = "cara";

        // If user entered nothing
        if (!text) {
            return m.reply(
`💸 *Hi Senpai~ I can help you withdraw your money!*  

✨ Usage Examples:
• *${prefix}withdraw 500*
• *${prefix}withdraw all*

Let me fetch your cash with extra love nya~ 💕`
            );
        }

        // Get user's balance
        const bal = await eco.balance(user, cara);
        let amount = text.trim();

        // User selected withdraw everything
        if (amount.toLowerCase() === "all") {
            amount = bal.bank;
        } else {
            amount = parseInt(amount);
        }

        // Validation
        if (isNaN(amount) || amount <= 0) {
            return m.reply("❌ *Invalid amount, Senpai!* I cannot withdraw 0 or negative gold. 😿");
        }

        // Try withdrawing
        const withdraw = await eco.withdraw(user, cara, amount);

        // 🚫 FAILED CASE
        if (withdraw.noten || withdraw.amount === undefined) {
            return m.reply(
`😿 *Aww Senpai... You don’t have enough money in your bank!*

🏦 *Your Bank:* ${bal.bank.toLocaleString()}

Try withdrawing a smaller amount, okay? 💞`
            );
        }

        // ✔ SUCCESS — Give money to wallet now
        const added = await eco.give(user, cara, withdraw.amount);

        // SAFE VALUES (fallback logic)
        const taken = withdraw.amount;
        const newBank = withdraw.bank ?? withdraw.after ?? bal.bank - taken;
        const newWallet = added.wallet ?? added.after ?? bal.wallet + taken;

        // Buttons
        let buttons = [
            { buttonId: `${prefix}wallet`, buttonText: { displayText: "👛 Wallet" }, type: 1 },
            { buttonId: `${prefix}bank`, buttonText: { displayText: "🏦 Bank" }, type: 1 },
        ];

        // SUCCESS MESSAGE
        return Miku.sendMessage(
            m.from,
            {
                image: { url: botImage2 },
                caption:
`💖 *Withdrawal Complete, ${pushName}!*  

I fetched your cash with extra care nya~ 🐾

💸 *Withdrawn:* ${taken.toLocaleString()}
👛 *New Wallet:* ${newWallet.toLocaleString()}
🏦 *Bank Left:* ${newBank.toLocaleString()}

Spend it wisely... or gamble it away, I won’t judge~ 

Need anything else Senpai?`,
                footer: `*© ${global.botName} | Your Money Assistant*`,
                buttons,
                type: 4,
            },
            { quoted: m }
        );
    },
};