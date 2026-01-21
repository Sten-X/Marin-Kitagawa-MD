const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");

module.exports = {
    name: "networth",
    alias: [ "wealth"],
    desc: "Check total value of your account (Cards + Wallet)",
    category: "Economy",
    usage: "networth",
    react: "💹",
    start: async (Miku, m, { eco, prefix, pushName }) => {
        const user = m.sender;
        const currency = "cara";

        // 1. Get Wallet Balance
        const balance = await eco.balance(user, currency);
        const walletMoney = balance.wallet;
        const bankMoney = balance.bank;

        // 2. Get Card Value
        const userCards = await mkcard.find({ owner: user });
        let cardValue = 0;
        let totalCards = 0;

        userCards.forEach(uc => {
            const details = CardMgr.getCardById(uc.cardId);
            if (details) {
                // Total Value = Price * Count
                cardValue += (details.price * uc.count);
                totalCards += uc.count;
            }
        });

        // 3. Calculate Total
        const totalNetworth = walletMoney + bankMoney + cardValue;

        // Rank Logic
        let rank = "Hobo 🏚️";
        if (totalNetworth > 100000) rank = "Merchant 👜";
        if (totalNetworth > 1000000) rank = "Millionaire 🎩";
        if (totalNetworth > 100000000) rank = "Card God 👑";

        let buttons = [
            { buttonId: `${prefix}cardlb`, buttonText: { displayText: "🏆 cardlb" }, type: 1 },
            { buttonId: `${prefix}market`, buttonText: { displayText: "🏪 Spend Money" }, type: 1 }
        ];

        let msg = `💹 *Account Valuation for ${pushName}* 💹\n\n` +
                  `💰 *Wallet:* ${walletMoney.toLocaleString()}\n` +
                  `🏦 *Bank:* ${bankMoney.toLocaleString()}\n` +
                  `🃏 *Card Assets:* ${cardValue.toLocaleString()} (Cards: ${totalCards})\n` +
                  `-----------------------------\n` +
                  `💎 *TOTAL NETWORTH:* ${totalNetworth.toLocaleString()}\n` +
                  `🏷️ *Rank:* ${rank}`;

        // Use a fancy image
        let richImage = "https://i.imgur.com/O1S9y9S.jpeg"; 

        let buttonMessage = {
            image: { url: botImage2 },
            caption: msg,
            footer: `*${botName} Economy*`,
            buttons: buttons,
            type: 4
        };

        await Miku.sendMessage(m.from, buttonMessage, { quoted: m });
    }
};