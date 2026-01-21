const { Marika } = require("@shineiichijo/marika");
const marika = new Marika();

module.exports = {
  name: "anime",
  alias: ["animesearch"],
  desc: "To get an anime search result",
  category: "Search",
  usage: `anime <search term>`,
  react: "🍁",
  start: async (Miku, m, { text, prefix, args }) => {
    if (!args[0])
      return Miku.sendMessage(
        m.from,
        { text: `Please provide an anime name to search!` },
        { quoted: m }
      );

    const searchTerm = args.join(" ");

    try {
      // Use the correct method from the library
      const { data } = await marika.anime.getAnimeSearch({ q: searchTerm, limit: 1 });

      if (!data || data.length === 0) {
        return Miku.sendMessage(
          m.from,
          { text: `😕 No results found for "${searchTerm}".` },
          { quoted: m }
        );
      }

      const result = data[0];
      let details = `*『  Anime Search Engine 』*\n\n`;
      details += `*🎀 Anime Title:* ${result.title}\n`;
      details += `*🎋 Format:* ${result.type}\n`;
      details += `*📈 Status:* ${result.status.toUpperCase().replace(/_/g, " ")}\n`;
      details += `*🍥 Total episodes:* ${result.episodes}\n`;
      details += `*🎈 Duration:* ${result.duration}\n`;
      details += `*🧧 Genres:*\n`;
      result.genres.forEach(g => {
        details += `\t${g.name}\n`;
      });
      details += `*✨ Based on:* ${result.source.toUpperCase()}\n`;
      details += `*📍 Studios:*\n`;
      result.studios.forEach(s => {
        details += `\t${s.name}\n`;
      });
      details += `*🎴 Producers:*\n`;
      result.producers.forEach(p => {
        details += `\t${p.name}\n`;
      });
      details += `*🎐 Popularity:* ${result.popularity}\n`;
      details += `*🎏 Favorites:* ${result.favorites}\n`;
      details += `*🎇 Rating:* ${result.rating}\n`;
      details += `*🏅 Rank:* ${result.rank}\n\n`;
      details += `*🌐 URL:* ${result.url}\n\n`;

      await Miku.sendMessage(
        m.from,
        {
          image: { url: result.images.jpg.large_image_url },
          caption: details,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("Anime search error:", error);
      return Miku.sendMessage(
        m.from,
        { text: "❌ An error occurred while searching for the anime." },
        { quoted: m }
      );
    }
  },
};
