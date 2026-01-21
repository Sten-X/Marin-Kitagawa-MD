const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { mku, mk } = require("../../Database/dataschema.js");
const fs = require("fs");

module.exports = {
    name: "crash",
    desc: "Real-time Crash Aviator-style game",
    alias: ["aviator", "rocket"],
    category: "RPG",
    react: "🚀",

    start: async (
        Miku,
        m,
        { text, prefix, pushName, eco }
    ) => {

        const user = m.sender;
        const cara = "cara";

        // ===================== INPUT PARSING ======================
        if (!text)
            return m.reply(
                `🎀 *Crash Game (Real-Time)*\n\n` +
                `Usage: *${prefix}crash <bet> <auto_cashout>*\n` +
                `Example: *${prefix}crash 500 2.5*\n\n` +
                `💡 Tip: 1.3x–2.0x auto-cashout = safest strategy 💞`
            );

        const args = text.trim().split(" ");
        const bet = parseInt(args[0]);
        const auto = parseFloat(args[1]);

        if (!bet || !auto) return m.reply(`❗ Example: ${prefix}crash 300 1.8`);
        if (bet < 100) return m.reply(`❌ Minimum bet: *100 Gold*`);
        if (auto < 1.1) return m.reply(`❗ Auto-cashout must be 1.1x or higher.`);

        // ===================== BALANCE CHECK ======================
        const bal = await eco.balance(user, cara);
        if (bal.wallet < bet) {
            return m.reply(`💸 *Not enough Gold, Senpai…*`);
        }

        // Deduct money first
        await eco.deduct(user, cara, bet);

        // ===================== CRASH ALGORITHM =====================
        // This formula creates realistic Aviator crash curve
        let crashPoint = (0.99 / (1 - Math.random()));
        crashPoint = parseFloat(crashPoint.toFixed(2));

        let multiplier = 1.00;
        let isCashedOut = false;

        // Anime cute lines ❤️
        const cuteLines = [
            "Nyaa~ rocket is flying 🚀💗",
            "Don't blink Senpai, multiplier rising ✨",
            "S-Sugoi… it's going higher 😳🔥",
            "Careful Senpai… high numbers are risky 😼",
            "Just trust your instincts… maybe 👀",
            "UwU so exciting!! 💞"
        ];

        // ===================== SEND INITIAL MESSAGE =====================
        let msg = await Miku.sendMessage(
            m.from,
            {
                text:
                    `🚀 *CRASH GAME STARTED*\n\n` +
                    `🧑 Player: *${pushName}*\n` +
                    `💰 Bet: *${bet} Gold*\n` +
                    `🎯 Auto Cashout: *${auto}x*\n\n` +
                    `📈 Multiplier: *1.00x*\n` +
                    `✨ ${cuteLines[Math.floor(Math.random()*cuteLines.length)]}`
            },
            { quoted: m }
        );

        // ===================== REAL-TIME EDIT LOOP =====================
        while (multiplier < crashPoint) {

            await new Promise(res => setTimeout(res, 900)); // smooth update delay

            multiplier += multiplier * (Math.random() * 0.40); // exponential curve
            if (multiplier > crashPoint) multiplier = crashPoint;

            const display = multiplier.toFixed(2);

            let status = "🚀 Flying…";
            if (!isCashedOut && multiplier >= auto) {
                isCashedOut = true;
                status = "💖 CASHED OUT!";
            }

            // EDIT SAME MESSAGE
            await Miku.sendMessage(
                m.from,
                {
                    text:
                        `🚀 *CRASH GAME LIVE*\n\n` +
                        `🧑 Player: *${pushName}*\n` +
                        `💰 Bet: *${bet} Gold*\n` +
                        `🎯 Auto Cashout: *${auto}x*\n\n` +
                        `📈 Multiplier: *${display}x*\n` +
                        `📌 Status: *${status}*\n\n` +
                        `🎀 ${cuteLines[Math.floor(Math.random()*cuteLines.length)]}`,
                    edit: msg.key
                }
            );

            if (isCashedOut) break;
        }

        // Small delay before final result message
        await new Promise(res => setTimeout(res, 700));

        // ===================== FINAL RESULT =====================
        if (isCashedOut) {
            const winAmount = Math.floor(bet * auto);
            await eco.give(user, cara, winAmount);

            return Miku.sendMessage(
                m.from,
                {
                    text:
                        `🎉 *YOU WON SENPAI!* 💞\n\n` +
                        `💥 Crash Point: *${crashPoint}x*\n` +
                        `🛫 You exited at: *${auto}x*\n` +
                        `💰 Profit Earned: *${winAmount} Gold*\n\n` +
                        `🎀 Play again? I believe in your luck ♥`
                },
                { quoted: m }
            );
        }

        // If user did NOT cash out (loss)
        return Miku.sendMessage(
            m.from,
            {
                text:
                    `💀 *YOU LOST SENPAI…*\n\n` +
                    `💥 Crash Point: *${crashPoint}x*\n` +
                    `🎯 Your Target: *${auto}x*\n` +
                    `💸 Lost Bet: *${bet} Gold*\n\n` +
                    `🎀 Tip: Don't be greedy next time, okay? UwU 💗`
            },
            { quoted: m }
        );
    }
};