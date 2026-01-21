const yts = require('youtube-yts');

module.exports = {
  name: "youtubesearch",
  alias: ["yts"],
  desc: "To search a video on YouTube",
  category: "Search",
  usage: `yts <search term>`,
  react: "🍁",
  start: async (Miku, m, { args, prefix, botName }) => {
    if (!args[0]) {
      return Miku.sendMessage(
        m.from,
        { text: `❌ Please provide a search term!` },
        { quoted: m }
      );
    }

    const text = args.join(" ");
    try {
      let search = await yts(text);
      let num = 1;
      let sections = [];

      for (let i of search.all) {
        const list = {
          title: `Result: ${num++}`,
          rows: [
            {
              title: i.title,
              rowId: `${prefix}play ${i.title}`,
              description: `Duration: ${i.timestamp}`,
            },
          ],
        };
        sections.push(list);
      }

      const txt = `*『  YouTube Search Engine 』*\n\n🔍 Search: *${text}*\n\nChoose a song to play:\n`;

      const buttonMessage = {
        text: txt,
        footer: `*${botName}*`,
        buttonText: "Choose Song",
        sections,
      };

      await Miku.sendMessage(m.from, buttonMessage, { quoted: m });
    } catch (err) {
      console.error("YouTube search error:", err);
      await Miku.sendMessage(m.from, { text: "❌ Failed to search YouTube." }, { quoted: m });
    }
  },
};
