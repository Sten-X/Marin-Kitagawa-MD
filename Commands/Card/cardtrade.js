const fs = require("fs");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");
const { processCardMedia } = require("../../lib/converter.js"); // <-- MP4 SUPPORT ADDED

// Global Map for Trade Requests
if (!global.cardTradeRequests) global.cardTradeRequests = new Map();

module.exports = {
    name: "cardtrade",
    alias: ["ctrade"],
    desc: "Trade cards with another user securely",
    category: "Cards",
    usage: "cardtrade <my_card> <their_card> @user",
    react: "🤝",

    start: async (Miku, m, { text, args, mentionByTag, prefix, pushName }) => {

        if (args[0] === "accept") {
            const req = global.cardTradeRequests.get(m.sender);
            if (!req) return m.reply("❌ No pending trade requests for you!");

            const { initiator, myCardId, theirCardId } = req;

            const senderDB = await mkcard.findOne({ owner: initiator, cardId: myCardId });
            const receiverDB = await mkcard.findOne({ owner: m.sender, cardId: theirCardId });

            if (!senderDB || !receiverDB) {
                global.cardTradeRequests.delete(m.sender);
                return m.reply("⚠️ Trade failed! One of you no longer owns the required card.");
            }

            // ---- SWAP BEGINS ----

            // Initiator → Receiver
            if (senderDB.count > 1) senderDB.count--;
            else await mkcard.deleteOne({ _id: senderDB._id });
            await senderDB.save().catch(() => {});

            let recvGain = await mkcard.findOne({ owner: m.sender, cardId: myCardId });
            if (recvGain) recvGain.count++;
            else recvGain = new mkcard({ owner: m.sender, cardId: myCardId, count: 1 });
            await recvGain.save();

            // Receiver → Initiator
            if (receiverDB.count > 1) receiverDB.count--;
            else await mkcard.deleteOne({ _id: receiverDB._id });
            await receiverDB.save().catch(() => {});

            let initGain = await mkcard.findOne({ owner: initiator, cardId: theirCardId });
            if (initGain) initGain.count++;
            else initGain = new mkcard({ owner: initiator, cardId: theirCardId, count: 1 });
            await initGain.save();

            global.cardTradeRequests.delete(m.sender);

            const c1 = CardMgr.getCardById(myCardId);
            const c2 = CardMgr.getCardById(theirCardId);

            let caption =
`🤝 *TRADE SUCCESSFUL!*  

✨ Cards have been swapped!  
━━━━━━━━━━━━━━  
👤 *${pushName}* received: *${c2.title}*  
👤 *@${initiator.split("@")[0]}* received: *${c1.title}*  
━━━━━━━━━━━━━━`;

            // Winner image or video
            const media = await processCardMedia(c2.imageUrl);
            let deleteAfter = null;

            const msg = media.type === "video"
                ? {
                      video: { url: media.path },
                      caption,
                      gifPlayback: true,
                      mentions: [initiator, m.sender]
                  }
                : {
                      image: { url: c2.imageUrl },
                      caption,
                      mentions: [initiator, m.sender]
                  };

            await Miku.sendMessage(m.from, msg, { quoted: m });

            if (media.type === "video" && fs.existsSync(media.path)) fs.unlinkSync(media.path);

            return;
        }

        if (!args[0] || !args[1] || !mentionByTag[0]) {
            return m.reply(`🤝 Usage:\n*${prefix}cardtrade <YourCardNumber> <TheirCardID> @user*`);
        }

        const myInput = args[0];
        const targetInput = args[1];
        const targetUser = mentionByTag[0];

        if (targetUser === m.sender)
            return m.reply("😐 You can't trade with yourself.");

        let myCardDB = null;

        if (!isNaN(myInput)) {
            const index = parseInt(myInput) - 1;
            const myCards = await mkcard.find({ owner: m.sender });

            let sortedMy = myCards
                .map(uc => ({ ...CardMgr.getCardById(uc.cardId), db: uc }))
                .filter(x => x.id)
                .sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

            if (index >= 0 && index < sortedMy.length) myCardDB = sortedMy[index].db;
        } else {
            myCardDB = await mkcard.findOne({ owner: m.sender, cardId: myInput });
        }

        if (!myCardDB)
            return m.reply("🚫 You don't own the card you're offering!");

        const targetCardDB = await mkcard.findOne({ owner: targetUser, cardId: targetInput });

        if (!targetCardDB)
            return m.reply("🚫 Target user doesn't own that card!");

        const c1 = CardMgr.getCardById(myCardDB.cardId);
        const c2 = CardMgr.getCardById(targetCardDB.cardId);

        global.cardTradeRequests.set(targetUser, {
            initiator: m.sender,
            myCardId: c1.id,
            theirCardId: c2.id
        });

        // Auto-expire after 1 min
        setTimeout(() => {
            if (global.cardTradeRequests.has(targetUser))
                global.cardTradeRequests.delete(targetUser);
        }, 60000);
        const preview = await processCardMedia(c1.imageUrl);
        let deletePreview = null;

        const offerText =
`🔄 *TRADE PROPOSAL!* 🔄  

👤 *From:* ${pushName}  
📤 *Offers:* ${c1.title} (${c1.tier}⭐)

👤 *To:* @${targetUser.split("@")[0]}  
📥 *Wants:* ${c2.title} (${c2.tier}⭐)

✨ Do you accept this trade?`;

        const btn = [
            {
                buttonId: `${prefix}cardtrade accept`,
                buttonText: { displayText: "✅ ACCEPT TRADE" },
                type: 1
            }
        ];

        const msg =
            preview.type === "video"
                ? {
                      video: { url: preview.path },
                      caption: offerText,
                      footer: `${global.botName} Trade Center`,
                      gifPlayback: true,
                      mentions: [targetUser],
                      buttons: btn
                  }
                : {
                      image: { url: c1.imageUrl },
                      caption: offerText,
                      footer: `${global.botName} Trade Center`,
                      mentions: [targetUser],
                      buttons: btn
                  };

        await Miku.sendMessage(m.from, msg, { quoted: m });

        if (preview.type === "video" && fs.existsSync(preview.path))
            fs.unlinkSync(preview.path);
    }
};