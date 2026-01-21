const fs = require("fs");
const YT = require("../../lib/ytdl-core.js");

module.exports = {
  name: "ytvdl",
  alias: [],
  desc: "Download a YouTube video in selected quality",
  category: "Media",
  usage: `ytvdl <480|720|1080> <youtube url>`,
  react: "🍁",

  start: async (Miku, m, { args, prefix }) => {

    // 🔎 Validation
    if (!args[0] || !args[1]) {
      return Miku.sendMessage(
        m.from,
        {
          text:
            `❗ *Invalid usage!*\n\n` +
            `📌 *Correct format:*\n` +
            `👉 ${prefix}ytvdl <480|720|1080> <YouTube URL>\n\n` +
            `✨ Example:\n` +
            `👉 ${prefix}ytvdl 720 https://youtu.be/xxxxx`
        },
        { quoted: m }
      );
    }

    const quality = parseInt(args[0], 10);
    const url = args.slice(1).join(" ");

    if (![480, 720, 1080].includes(quality)) {
      return Miku.sendMessage(
        m.from,
        { text: "⚠️ *Quality must be 480, 720, or 1080 only!*" },
        { quoted: m }
      );
    }

    try {
      // ⏳ Inform user
      await Miku.sendMessage(
        m.from,
        { text: "🎬 *Downloading video...*\nPlease wait a moment ✨" },
        { quoted: m }
      );

      // 📥 Download video
      const { path: filePath, meta } = await YT.downloadMp4(url, quality);

      // 📤 Send video
      await Miku.sendMessage(
        m.from,
        {
          video: fs.readFileSync(filePath),
          mimetype: "video/mp4",
          caption:
            `🎞️ *Title:* ${meta.title}\n` +
            `📺 *Quality:* ${meta.quality}p\n\n` +
            `💖 Enjoy your video!`,
        },
        { quoted: m }
      );

      // 🧹 Cleanup
      fs.unlinkSync(filePath);

    } catch (e) {
      console.error(e);
      await Miku.sendMessage(
        m.from,
        {
          text:
            `❌ *Download failed!*\n\n` +
            `📌 Reason: ${e.message}\n\n` +
            `💡 *Tip:* Try a lower quality like *480p* or check the link.`,
        },
        { quoted: m }
      );
    }
  }
};