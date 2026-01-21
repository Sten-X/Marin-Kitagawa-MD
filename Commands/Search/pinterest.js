const axios = require("axios");
const fs = require("fs");
const path = require("path");

const SERPER_KEY = "13b0542377b580935a8456cc86603ec86c997de4";
const TMP_DIR = process.cwd();

function isPinterestUrl(text) {
  return /pinterest\.com|pin\.it/i.test(text);
}

// 🔽 Download helper
async function downloadMedia(url, ext = "jpg") {
  const filePath = path.join(TMP_DIR, `pin_${Date.now()}.${ext}`);
  const writer = fs.createWriteStream(filePath);

  const res = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  res.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

module.exports = {
  name: "pinterest",
  alias: ["pin"],
  desc: "Here is Your Pinterest image & video search + download",
  category: "Search",
  react: "📌",

  start: async (Miku, m, { args, prefix, botName }) => {
    if (!args.length) {
      return Miku.sendMessage(
        m.from,
        {
          text:
            "❌ Use:\n" +
            "• pin <search>\n" +
            "• pin video <search>\n" +
            "• pin nsfw <search>\n" +
            "• pin <pinterest link>"
        },
        { quoted: m }
      );
    }

    const input = args.join(" ");

    try {
      // =========================
      // 🔗 PINTEREST LINK DOWNLOAD
      // =========================
      if (isPinterestUrl(input)) {
        const oembed =
          `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(input)}`;
        const { data } = await axios.get(oembed);

        const filePath = await downloadMedia(data.thumbnail_url, "jpg");

        await Miku.sendMessage(
          m.from,
          {
            image: fs.readFileSync(filePath),
            caption: `📌 *Pinterest Download*\n\n${data.title || ""}`
          },
          { quoted: m }
        );

        fs.unlinkSync(filePath);
        return;
      }

      // =========================
      // 🎥 VIDEO SEARCH + DOWNLOAD
      // =========================
      if (args[0].toLowerCase() === "video") {
        const query = args.slice(1).join(" ");

        const res = await axios.post(
          "https://google.serper.dev/videos",
          { q: query },
          {
            headers: {
              "X-API-KEY": SERPER_KEY,
              "Content-Type": "application/json"
            }
          }
        );

        const vids = res.data?.videos;
        if (!vids || vids.length === 0) {
          return Miku.sendMessage(
            m.from,
            { text: `😕 "${query}" Video Not Found.` },
            { quoted: m }
          );
        }

        const v = vids[0];

        // 🔽 download video preview / direct video
        const filePath = await downloadMedia(v.thumbnail || v.image, "mp4");

        await Miku.sendMessage(
          m.from,
          {
            video: fs.readFileSync(filePath),
            caption:
              `🎥 *Video Result*\n\n` +
              `🔍 ${query}`
          },
          { quoted: m }
        );

        fs.unlinkSync(filePath);
        return;
      }

      // =========================
      // 🔞 / NORMAL IMAGE SEARCH
      // =========================
      const isNSFW = args[0].toLowerCase() === "nsfw";
      const query = isNSFW ? args.slice(1).join(" ") : input;

      const res = await axios.post(
        "https://google.serper.dev/images",
        {
          q: query,
          safe: isNSFW ? "off" : "active"
        },
        {
          headers: {
            "X-API-KEY": SERPER_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      const images = res.data?.images;
      if (!images || images.length === 0) {
        return Miku.sendMessage(
          m.from,
          { text: `😕 "${query}" Not Result Found.` },
          { quoted: m }
        );
      }

      const pick =
        images[Math.floor(Math.random() * images.length)];

      const buttons = [
        {
          buttonId: `${prefix}pin ${query}`,
          buttonText: { displayText: "🔁 More" },
          type: 1
        },
        {
          buttonId: `${prefix}pin video ${query}`,
          buttonText: { displayText: "🎥 Video" },
          type: 1
        }
      ];

      await Miku.sendMessage(
        m.from,
        {
          image: { url: pick.imageUrl },
          caption:
            ` *Pinterest Result*\n\n` +
            `🔍 ${query}`,
          footer: `Powered by *© ${global.botName}* `,
          buttons,
          headerType: 4
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("Pinterest Error:", err.response?.data || err.message);
      return Miku.sendMessage(
        m.from,
        { text: "❌ Service error. Try again later." },
        { quoted: m }
      );
    }
  }
};