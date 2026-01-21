const axios = require("axios");

// Delay function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  name: "lyrics",
  alias: ["karaoke"],
  desc: "Real-time Typing Lyrics with Final Button Dashboard",
  category: "Fun",
  usage: "lyrics <song name>",
  react: "🍁",
  start: async (Miku, m, { text, prefix}) => {
    
    if (!text) {
      return m.reply(
        `⚠️ Please provide the song name!\nExample: *${prefix}lyrics Dil Diyan Gallan*`
      );
    }

    // 1. Placeholder Message (Live Typing Start)
    let { key } = await Miku.sendMessage(
      m.from,
      { text: "🎵 *Connecting to Studio...*" },
      { quoted: m }
    );

    try {
        // 2. API Call (Using Proxy API)
        const apiUrl = `https://sten-x-nsfw-api.vercel.app/api/lyrics?query=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status) {
            return Miku.sendMessage(
              m.from,
              { text: "❌ Lyrics not found.", edit: key }
            );
        }

        const res = data.result;
        let fullLyrics = res.lyrics;

        // 3. Live Typing Loop 🔄
        let lines = fullLyrics.split("\n").filter(line => line.trim() !== "");
        let currentDisplay =
          `🎤 *${res.title}*\n` +
          `👤 *${res.artist}*\n` +
          `──────────────────\n\n`;

        // Show only top 15 lines live (to avoid boredom and load buttons faster)
        let limit = lines.length > 15 ? 15 : lines.length;

        for (let i = 0; i < limit; i++) {
            currentDisplay += "🍁 " + lines[i] + "\n";
            
            // Edit Message
            await Miku.sendMessage(m.from, { 
                text: currentDisplay + "\n⏳ *Typing...*", 
                edit: key 
            });

            await sleep(2000); // 2 seconds typing speed
        }

        // 4. Live Message End
        await Miku.sendMessage(m.from, { 
            text:
              currentDisplay +
              `\n✅ *Live Session Ended.*\n⬇️ *Full Lyrics Below* ⬇️`,
            edit: key 
        });

        // 5. FINAL DASHBOARD (Header, Footer, Buttons, Image) 🌟
        
        // Proxy Image for Safety
        const proxyThumb = `https://sten-x-nsfw-api.vercel.app/api/proxy?url=${encodeURIComponent(res.thumbnail)}`;

        // Full Lyrics Formatting
        let finalLyrics =
          fullLyrics.length > 2000
            ? fullLyrics.substring(0, 2000) + "...(Read More on Web)"
            : fullLyrics;

        let caption =
          `🎤 *${res.title}* (Full Lyrics)\n` +
          `👤 *Artist:* ${res.artist}\n` +
          `──────────────────\n\n` +
          `${finalLyrics}\n\n` +
          `──────────────────\n` +
          `💡 *Tip:* Use the button below to play the song!`;

        // Button
        const buttons = [
            {
                buttonId: `${prefix}play ${res.title}`,
                buttonText: { displayText: "🎧 Play Song" },
                type: 1,
            }
        ];

        // Sending Final Message
        await Miku.sendMessage(
          m.from,
          { 
            image: { url: proxyThumb },
            caption: caption,
            footer: `*${botName}*`,
            buttons: buttons,
            headerType: 4
          },
          { quoted: m }
        );

    } catch (e) {
        console.error("Live Lyrics Error:", e);
        Miku.sendMessage(
          m.from,
          { text: "❌ Error: Network timeout.", edit: key }
        );
    }
  }
};
