const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { mku, mk } = require("../../Database/dataschema.js");
const fs = require("fs");

module.exports = {
    name: "timebomb",
    alias: ["bomb", "tbomb"],
    desc: "Cut the correct wire before bomb explodes!",
    category: "RPG",
    react: "💣",

    start: async (
        Miku,
        m,
        { text, prefix, pushName, eco }
    ) => {

        const user = m.sender;
        const cara = "cara";

        // ------------------- INPUT CHECK ------------------- //
        if (!text)
            return m.reply(
                `💣 *Time Bomb Gambling Game*\n\n` +
                `Usage: *${prefix}timebomb <bet> <red/blue/green>*\n` +
                `Example: *${prefix}timebomb 200 red*\n\n` +
                `💡 Tip: Blue wire statistically best choice UwU 💗`
            );

        const args = text.split(" ");
        const bet = parseInt(args[0]);
        const wire = (args[1] || "").toLowerCase();

        if (!bet || bet < 100)
            return m.reply(`❗ Minimum bet: *100 Gold*`);
        if (!["red", "blue", "green"].includes(wire))
            return m.reply(`❗ Choose: *red / blue / green*`);

        const bal = await eco.balance(user, cara);
        if (bal.wallet < bet)
            return m.reply(`💸 Senpai… you don't have enough Gold!`);

        // Deduct bet first
        await eco.deduct(user, cara, bet);


        // ------------------- BOMB SETUP -------------------- //
        const countdown = Math.floor(Math.random() * 7) + 5; // 5–12 sec
        const safeWire = ["red", "blue", "green"][Math.floor(Math.random() * 3)];
        const multiplier = (Math.random() * 1.5 + 1.5).toFixed(2); // 1.5x – 3.0x

        const cuteLines = [
            "Nyaa~ hurry Senpai!! 😳💗",
            "Don't panic… maybe you'll cut the right one 😭",
            "Aaaa the timer is ticking faster 😼💥",
            "UwU your hands are shaking…",
            "One wrong move and kaboom! 💣🔥"
        ];

        // ------------------- INITIAL MESSAGE ---------------- //
        let msg = await Miku.sendMessage(
            m.from,
            {
                text:
                    `💣 *TIME BOMB ACTIVATED!* 💣\n\n` +
                    `Bet: *${bet} Gold*\n` +
                    `Wire You Chose: *${wire.toUpperCase()}*\n` +
                    `Multiplier: *${multiplier}x*\n\n` +
                    `⏳ Timer: *${countdown}s*\n` +
                    `${cuteLines[Math.floor(Math.random() * cuteLines.length)]}`
            },
            { quoted: m }
        );


        // ------------------- REAL-TIME COUNTDOWN ---------------- //
        for (let i = countdown; i > 0; i--) {

            await new Promise(res => setTimeout(res, 1000));

            await Miku.sendMessage(
                m.from,
                {
                    text:
                        `💣 *TIME BOMB LIVE*\n\n` +
                        `Wire Chosen: *${wire.toUpperCase()}*\n` +
                        `⏳ Timer: *${i - 1}s*\n\n` +
                        `${cuteLines[Math.floor(Math.random() * cuteLines.length)]}`,
                    edit: msg.key
                }
            );
        }


        // ------------------- FINAL RESULT -------------------- //
        if (wire !== safeWire) {
            // ❌ WRONG WIRE — BOOM
            return Miku.sendMessage(
                m.from,
                {
                    text:
                        `💥 *BOOOOOM SENPAI!* 💣😭\n\n` +
                        `You cut: *${wire.toUpperCase()}*\n` +
                        `Safe wire was: *${safeWire.toUpperCase()}*\n\n` +
                        `💸 Lost *${bet} Gold*\n` +
                        `Don't cry… try again UwU 💗`
                },
                { quoted: m }
            );
        }

        // ✅ CORRECT WIRE — YOU WIN!
        const reward = Math.floor(bet * multiplier);
        await eco.give(user, cara, reward);

        return Miku.sendMessage(
            m.from,
            {
                text:
                    `🎉 *YOU DEFUSED THE BOMB SENPAI!* 😳✨\n\n` +
                    `Correct Wire: *${safeWire.toUpperCase()}*\n` +
                    `Multiplier: *${multiplier}x*\n\n` +
                    `💰 You won *${reward} Gold!* 🔥\n` +
                    `Sugoii Senpai… you're so brave 💗`
            },
            { quoted: m }
        );
    }
};