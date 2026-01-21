const { SmartUpload, webp2mp4File } = require('../../lib/uploader');
const fs = require('fs');
const util = require('util');

module.exports = {
    name: "tourl",
    alias: ["makeurl"],
    desc: "Uploads media (image/video/sticker) and returns a direct URL.",
    category: "Utilities",
    usage: "Reply to an image/video/sticker and type the command",
    react: "🍁",

    start: async (Miku, m, { mime, quoted }) => {
        let mediaPath; // keep outside try for cleanup
        try {
            if (!quoted)
                return m.reply("⚠️ Please reply to an image, video, or sticker message!");
            if (!mime)
                return m.reply("⚠️ Cannot detect the media type. Please resend the media.");

            // Download quoted media to temp file
            mediaPath = await Miku.downloadAndSaveMediaMessage(quoted, 'temp_media');
            if (!mediaPath)
                return m.reply("❌ Failed to download media. Maybe it expired or is invalid.");

            let link;

            // 🌀 Handle different media types
            if (/webp/.test(mime)) {
                // Convert sticker/webp → MP4
                const mp4 = await webp2mp4File(mediaPath);
                link = mp4.result;
            } else {
                // Upload image/video using smart logic (Telegra.ph + fallback)
                link = await SmartUpload(mediaPath);
            }

            // ✅ Prepare message payload
            const caption = `✅ *Upload Successful!*\n\n🌐 *URL:* ${util.format(link)}`;
            let messagePayload = { caption };

            // Set proper media type
            if (/image/.test(mime)) {
                messagePayload.image = { url: mediaPath };
            } else if (/video/.test(mime) || /webp/.test(mime)) {
                messagePayload.video = { url: mediaPath };
            } else {
                messagePayload.document = { url: mediaPath };
            }

            // Send message
            await Miku.sendMessage(m.from, messagePayload, { quoted: m });

        } catch (err) {
            console.error("❌ Error in tourl command:", err.message || err);
            m.reply(`❌ Something went wrong:\n\n${err.message || err}`);

        } finally {
            // 🧹 Auto-delete temp file after sending or on error
            if (mediaPath && fs.existsSync(mediaPath)) {
                try {
                    fs.unlinkSync(mediaPath);
                    console.log(`🧹 Deleted temp file: ${mediaPath}`);
                } catch (delErr) {
                    console.warn(`⚠️ Failed to delete temp file: ${delErr.message}`);
                }
            }
        }
    }
};