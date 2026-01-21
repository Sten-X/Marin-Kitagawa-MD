const eco = require("discord-mongoose-economy");

module.exports = {
    name: "balance",
    alias: ["balctrl", "setbal", "moneyctrl"],
    desc: "Owner/Mod command to control user wallet & bank balance.",
    category: "Economy",
    react: "🛠️",

    start: async (Miku, m, { text, prefix, mentionByTag, isCreator, modStatus }) => {

        // ------- OWNER / MOD ONLY -------- //
        if (!isCreator && modStatus !== "true") {
            return m.reply("❌ Only *Owner / Mods* can use this command.");
        }

        // ------- Validate user mention -------- //
        if (!mentionByTag[0]) {
            return m.reply(`❗ Usage:\n${prefix}balance @user wallet set 5000`);
        }

        let user = mentionByTag[0];
        const cara = "kara";

        // ------- Parse Arguments -------- //
        const args = text.split(" ").slice(1);  
        if (args.length < 3) {
            return m.reply(`❗ Usage Example:\n${prefix}balance @user wallet add 5000`);
        }

        let type = args[0].toLowerCase();     // wallet / bank
        let action = args[1].toLowerCase();   // set / add / remove
        let amount = parseInt(args[2]);       // numeric value

        if (!["wallet", "bank"].includes(type))
            return m.reply("❌ Type must be: *wallet* or *bank*");

        if (!["set", "add", "remove"].includes(action))
            return m.reply("❌ Action must be: *set / add / remove*");

        if (isNaN(amount) || amount < 0)
            return m.reply("❌ Invalid amount");

        // ------- Get current balance -------- //
        const balance = await eco.balance(user, cara);

        let newVal = 0;

        // ================================================================
        //                    ACTION HANDLER (WORKING)
        // ================================================================

        // ----------- WALLET ------------- //
        if (type === "wallet") {
            if (action === "set") {
                await eco.set(user, cara, { wallet: amount });
                newVal = amount;
            }
            if (action === "add") {
                await eco.give(user, cara, amount);
                newVal = balance.wallet + amount;
            }
            if (action === "remove") {
                await eco.deduct(user, cara, amount);
                newVal = Math.max(0, balance.wallet - amount);
            }
        }

        // ----------- BANK ------------- //
        if (type === "bank") {
            if (action === "set") {
                await eco.set(user, cara, { bank: amount });
                newVal = amount;
            }
            if (action === "add") {
                await eco.deposit(user, cara, amount);
                newVal = balance.bank + amount;
            }
            if (action === "remove") {
                await eco.withdraw(user, cara, amount);
                newVal = Math.max(0, balance.bank - amount);
            }
        }

        // ------- Reply (Success) ------- //
        return Miku.sendMessage(m.from, {
            text:
`🛠️ Balance Updated Successfully

👤 User: @${user.split("@")[0]}
💼 Type: *${type.toUpperCase()}*
⚙️ Action: *${action.toUpperCase()}*
💰 New Amount: *${newVal.toLocaleString()}*

Done ✔`,
            mentions: [user]
        }, { quoted: m });
    }
};