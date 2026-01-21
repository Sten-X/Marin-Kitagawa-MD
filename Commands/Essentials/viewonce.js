const { downloadContentFromMessage } = require("@adiwajshing/baileys");

module.exports = {
    name: "viewonce",
    alias: ["vv", "retrieve", "readviewonce"],
    desc: "Magically unwraps View Once media~ ✨",
    category: "Essentials",
    usage: "viewonce <reply>",
    react: "🫣",

    start: async (Miku, m, { prefix, pushName }) => {
        try {
            // Safe bot name fallback
            const botName = typeof global.botName !== "undefined" ? global.botName : "Magical Waifu";

            if (!m.quoted)
                return m.reply(" *Nyaa~ Senpai! Reply to a View Once message first~*");


            let msg =
                m.quoted.msg ||
                m.quoted.message ||
                m.quoted.messages ||
                m.quoted ||
                null;

            if (!msg) {
                console.log("🟥 RAW QUOTED (no content):", m.quoted);
                return m.reply("❌ *Ehh? I couldn't find the hidden content…* 😿");
            }

            const unwrap = (obj, key) =>
                obj?.[key]?.message ? obj[key].message : obj;

            msg = unwrap(msg, "ephemeralMessage");
            msg = unwrap(msg, "viewOnceMessageV2");
            msg = unwrap(msg, "viewOnceMessage");

            let mediaContent =
                msg.imageMessage ||
                msg.videoMessage ||
                msg?.msg?.imageMessage ||
                msg?.msg?.videoMessage ||
                m.quoted?.imageMessage ||
                m.quoted?.videoMessage ||
                null;

            let mediaType = "";
            let streamType = "";

            if (mediaContent?.mimetype?.startsWith("image")) {
                mediaType = "image";
                streamType = "image";
            } else if (mediaContent?.mimetype?.startsWith("video")) {
                mediaType = "video";
                streamType = "video";
            } else {
                console.log("🟥 UNKNOWN STRUCTURE:", JSON.stringify(msg, null, 2));
                return m.reply("❌ *Umm… this isn’t a View Once image or video, Senpai.*");
            }

            await Miku.sendMessage(
                m.from,
                {
                    text: `🫣 *Y-You want me to reveal the hidden media, ${pushName}?*  
                    
Hold on~ I'm peeling off the magical view-once seal… ✨🔍`,
                },
                { quoted: m }
            );

            // Small delay for dramatic effect 💞
            await new Promise((resolve) => setTimeout(resolve, 900));

            const stream = await downloadContentFromMessage(mediaContent, streamType);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const cuteCaption =
                mediaType === "image"
                    ? ` *Tada~!*  
Nyaa~ I secretly opened the View Once image for you, *${pushName}*…  
Don't worry, I won't tell anyone~`
                    : `🎥 *Hehe~*  
I peeked at the View Once video and brought it back just for you, *${pushName}*!  
You're welcome~ 🫣💞`;

            const messageObject =
                mediaType === "image"
                    ? { image: buffer, caption: cuteCaption }
                    : { video: buffer, caption: cuteCaption };

            await Miku.sendMessage(
                m.from,
                {
                    ...messageObject,
                    contextInfo: { forwardingScore: 999, isForwarded: true },
                },
                { quoted: m }
            );
        } catch (err) {
            console.error("💔 ViewOnce Error:", err);
            return m.reply(
                `😿 *Oh no, ${pushName}… something went wrong while opening the View Once media.*  
But don't worry, I'll try harder next time! 💖`
            );
        }
    },
};
