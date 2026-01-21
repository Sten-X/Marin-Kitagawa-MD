const fs = require("fs");

module.exports = {
    name: "transfer",
    alias: ["give", "send"],
    desc: "Send gold to another user 💖",
    category: "Economy",
    react: "💴",

    start: async (Miku, m, { text, prefix, pushName, mentionByTag, eco }) => {

        if (!text) {
            return m.reply(
`💸 *Transfer Command Usage, Senpai~*

Example:  
• ${prefix}transfer 500 @user  
• ${prefix}give 2000 @user  

Send gold safely to your friends nya~ 💕`
            );
        }

        const parts = text.split(" ");
        const amount = parseInt(parts[0]);

        if (isNaN(amount) || amount <= 0) {
            return m.reply("❌ *Senpai, please enter a valid positive amount!* 😿");
        }

        let receiver;
        if (m.quoted) receiver = m.quoted.sender;
        else receiver = mentionByTag[0];

        if (!receiver) {
            return m.reply("😿 *Please tag someone to transfer money, Senpai!*");
        }

        if (receiver === m.sender) {
            return m.reply("🙅‍♀️ *Senpai, you can’t transfer money to yourself!* 🤦‍♂️");
        }

        const sender = m.sender;
        const cara = "cara";

        const bal = await eco.balance(sender, cara);

        if (bal.wallet < amount) {
            return m.reply(
`❌ *Insufficient funds, Senpai!*  

👛 Your Wallet: ${bal.wallet.toLocaleString()}  
💸 Transfer Amount: ${amount.toLocaleString()}

Try sending a smaller amount nya~ 💕`
            );
        }

        // Deduct and give
        await eco.deduct(sender, cara, amount);
        await eco.give(receiver, cara, amount);

        // FIX: SAFE RECEIVER NAME
        let receiverName;
        try {
            receiverName = await Miku.getName(receiver);
        } catch {
            receiverName = receiver.split("@")[0];  // fallback
        }

        let buttons = [
            { buttonId: `${prefix}wallet`, buttonText: { displayText: "💳 Check Wallet" }, type: 1 },
            { buttonId: `${prefix}bank`, buttonText: { displayText: "🏦 Check Bank" }, type: 1 }
        ];

        return Miku.sendMessage(
            m.from,
            {
                image: fs.readFileSync("./Assets/Img/card.png"),
                caption:
`📠 *Transfer Successful, ${pushName} Senpai!* 💖

✨ You sent:
💴 *${amount.toLocaleString()} Gold*

🎁 Receiver:  
@${receiver.split("@")[0]} (*${receiverName}*)

You’re so sweet sharing your gold nya~ 🐾💞`,
                footer: `*© ${global.botName} | Money Transfer*`,
                mentions: [receiver],
                buttons,
                type: 4,
            },
            { quoted: m }
        );
    }
};