const axios = require("axios");

module.exports = {
  name: "google",
  alias: ["search"],
  desc: "Search something in Google",
  category: "Search",
  usage: `google <search term>`,
  react: "🍁",
  start: async (Miku, m, { text, prefix, args }) => {
    if (!args[0]) {
      return Miku.sendMessage(
        m.from,
        { text: `Please provide a Search Term!` },
        { quoted: m }
      );
    }

    const searchTerm = args.join(" ");
    const apiKey = "b66cb00587d05fb94e64ec9c396ed2e8feee9ee0f8d0e94c342b989058f9ac98"; // 🔐 Get it from serpapi.com

    try {
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          q: searchTerm,
          api_key: apiKey,
          engine: "google",
        },
      });

      const results = response.data.organic_results;
      if (!results || results.length === 0) {
        return Miku.sendMessage(
          m.from,
          { text: "😕 No results found for your search query." },
          { quoted: m }
        );
      }

      let resText = `*『 ⚡️ Google Search Engine ⚡️ 』*\n\n_🔍 Search Term:_ *${searchTerm}*\n\n`;

      for (let i = 0; i < results.length && i < 10; i++) {
        const r = results[i];
        resText += `_📍 Result:_ *${i + 1}*\n\n_🎀 Title:_ *${r.title || "N/A"}*\n\n_🔷 Link:_ *${r.link || "N/A"}*\n\n_🔶 Snippet:_ *${r.snippet || "N/A"}*\n\n\n`;
      }

      await Miku.sendMessage(
        m.from,
        {
          video: { url: "https://media.tenor.com/3aaAzbTrTMwAAAPo/google-technology-company.mp4" },
          gifPlayback: true,
          caption: resText,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("Search error:", err.message);
      return Miku.sendMessage(
        m.from,
        { text: "❌ Error fetching results from Google." },
        { quoted: m }
      );
    }
  },
};
