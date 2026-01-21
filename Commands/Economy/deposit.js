const eco = require("discord-mongoose-economy");

module.exports = {
    name: "deposit",
    alias: ["dep", "save"],
    desc: "Deposit money into your bank",
    category: "Economy",
    usage: "deposit <amount> | deposit all",
    react: "🏦",

    start: async (Miku, m, { text, prefix, pushName }) => {

        const user = m.sender;
        const cara = "cara";

        if (!text) {
            return m.reply(
`🏦 *Welcome to ${global.botName} Bank, ${pushName}!* 💗

✨ To keep your money safe inside my vault:
• *${prefix}deposit 500*
• *${prefix}deposit all*

Let's save money together, nya~ 💕`
            );
        }

        const bal = await eco.balance(user, cara);
        let amount = text.trim();

        if (amount.toLowerCase() === "all") {
            amount = bal.wallet;
        } else {
            amount = parseInt(amount);
        }

        if (isNaN(amount) || amount <= 0) {
            return m.reply("❌ *Invalid amount, Senpai!* Deposit something greater than zero. 😿");
        }

        // Try deposit
        const deposit = await eco.deposit(user, cara, amount);

        // FAIL CASE
        if (deposit.noten || deposit.amount === undefined) {
            return m.reply(
`😿 *Transaction Failed, Senpai!*  
Your wallet doesn't have enough money.

👛 *Your Wallet:* ${bal.wallet.toLocaleString()}`
            );
        }

        // SAFE VALUES (fallback system)
        const deposited = deposit.amount || amount;  
        const newWallet = deposit.wallet ?? deposit.balance ?? bal.wallet - deposited;
        const newBank = deposit.bank ?? deposit.after ?? bal.bank + deposited;

        let buttons = [
            { buttonId: `${prefix}wallet`, buttonText: { displayText: "👛 Wallet" }, type: 1 },
            { buttonId: `${prefix}bank`, buttonText: { displayText: "🏦 Bank" }, type: 1 }
        ];

        return Miku.sendMessage(
            m.from,
            {
                image: { url: botImage2 },
                caption:
`📥 *Deposit Successful, ${pushName}!* 💖

✨ Your gold has safely reached my vault~

💰 *Deposited:* ${deposited.toLocaleString()}
👛 *Wallet Left:* ${newWallet.toLocaleString()}
🏦 *New Bank Balance:* ${newBank.toLocaleString()}

You're saving money like a pro~ `,
                footer: `*© ${global.botName} | Your Bank Assistant*`,
                buttons,
                type: 4,
            },
            { quoted: m }
        );
    },
};