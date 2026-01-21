const Booru = require("booru");
const fetch = require("node-fetch");

const sites = ["sb", "kn", "kc"];

module.exports = {
  name: "loli",
  alias: ["lolipic"],
  desc: "Get random anime / waifu images",
  react: "🍁",
  category: "Weeb",

  start: async (sock, m, { prefix, command }) => {
    try {
      // random anime / waifu image
      let res = await Booru.search(
        sites[Math.floor(Math.random() * sites.length)],
        ["loli"],
        { random: true }
      );

      if (!res || !res.length) {
        return sock.sendMessage(
          m.from,
          { text: "❌ No image found right now, try again!" },
          { quoted: m }
        );
      }

      let url = res[0].fileUrl;
      let short = await shortUrl(url);

      // tumhare bot ke style ke according
      await sock.sendMessage(
        m.from,
        {
          image: { url },
          caption: `
 *${botName}* 

*Random Anime Loli Image* 🎀

• Loli Image for more fun  
• Perfect for weeb lovers 😄

🔁 Try again:
*"${prefix}${command}"*
`,
        },
        { quoted: m }
      );

    } catch (e) {
      console.error(e);
      sock.sendMessage(
        m.from,
        { text: "⚠️ Something went wrong, try later!" },
        { quoted: m }
      );
    }
  }
};

// tinyurl shortener
async function shortUrl(url) {
  try {
    return await (
      await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
    ).text();
  } catch {
    return url;
  }
}