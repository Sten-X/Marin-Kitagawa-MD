// Commands/Media/ytmix.js
const yts = require("youtube-yts");

module.exports = {
  name: "ytmix",
  alias: ["mix"],
  desc: "Get YouTube Mix of similar songs",
  category: "Media",
  usage: `ytmix <song name>`,
  react: "🍁",

  start: async (Miku, m, { text, prefix, pushName }) => {
    if (!text)
      return Miku.sendMessage(m.from, { text: `Example: ${prefix}ytmix Shape of You` }, { quoted: m });

    try {
      const result = await yts(text);
      const videos = result.videos.slice(0, 5);
      let caption = `🎶 *YouTube Mix for:* ${text}\n\n`;

      videos.forEach((v, i) => {
        caption += `🎵 ${i + 1}. *${v.title}*\n🔗 ${v.url}\n\n`;
      });

      await Miku.sendMessage(
        m.from,
        { image: { url: videos[0].thumbnail }, caption },
        { quoted: m }
      );
    } catch (e) {
      await Miku.sendMessage(m.from, { text: `Error: ${e.message}` }, { quoted: m });
    }
  }
};