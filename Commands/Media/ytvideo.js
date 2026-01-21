const axios = require("axios");
const YT = require("../../lib/ytdl-core");

module.exports = {
  name: "ytvd",
  alias: ["ytvideo", "ytmp4"],
  category: "Media",
  react: "🍁",

  start: async (Miku, m, { args, text, prefix }) => {

    const url = args[0] || text;
    if (!url)
      return Miku.sendMessage(
        m.from,
        { text: `Example:\n${prefix}ytvd https://youtube.com/watch?v=xxxx` },
        { quoted: m }
      );

    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
      return Miku.sendMessage(
        m.from,
        { text: "❌ Please provide a valid YouTube link." },
        { quoted: m }
      );
    }

    try {
      await Miku.sendMessage(
        m.from,
        { text: "🔍 Fetching video, please wait..." },
        { quoted: m }
      );

      const data = await YT.mp4(url);

      await Miku.sendMessage(
        m.from,
        {
          image: { url: data.thumbnail },
          caption:
            `🎬 *Video Found!*\n\n` +
            `📌 *Title:* ${data.title}\n\n` +
            `📥 Downloading video...`
        },
        { quoted: m }
      );

      const videoStream = await axios.get(data.download, {
        responseType: "stream",
      });

      const size = videoStream.headers["content-length"];
      const chunks = [];

      for await (const chunk of videoStream.data) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      if (size && Number(size) > 64 * 1024 * 1024) {
        await Miku.sendMessage(
          m.from,
          {
            document: buffer,
            mimetype: "video/mp4",
            fileName: `${data.title}.mp4`,
            caption: "📦 Sent as document (large file)",
          },
          { quoted: m }
        );
      } else {
        await Miku.sendMessage(
          m.from,
          {
            video: buffer,
            mimetype: "video/mp4",
            fileName: `${data.title}.mp4`,
            caption: `🎬 *${data.title}*`,
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("YT VIDEO ERROR:", err);

      await Miku.sendMessage(
        m.from,
        {
          text:
            "💔 Video server is busy right now.\n" +
            "Please try again after some time.",
        },
        { quoted: m }
      );
    }
  },
};