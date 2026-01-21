const axios = require("axios");

module.exports = {
  name: "nsfwshorts",
  alias: ["porn", "nsfwreel","xxx"],
  desc: "Get NSFW Short Video",
  category: "NSFW",
  usage: "shorts <query>",
  react: "🍁",
  start: async (Miku, m, { text, prefix, NSFWstatus }) => {

    // 1. NSFW Check
    if (NSFWstatus == "false") {
        return m.reply(`❌ Oopsie! This group is not NSFW enabled 💔\n\nTo turn on NSFW mode, type:\n\n*${prefix}nsfw*`);
    }

    let query = text ? text : "hot";
    m.reply("🔍 Searching something spicy for you... hehe "); 

    try {
        // 2. API Call (Your Vercel API)
        const apiUrl = `https://sten-x-nsfw-api.vercel.app/api/nsfw/shorts?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status) {
            return m.reply("🥺 Aww! No video found this time.");
        }

        const res = data.result;

        // Caption
        const caption = `🔞 *${res.title}*\n` +
                        `⏱️ *Duration:* ${res.duration}\n` +
                        `📺 *Quality:* HD\n` +
                        `🔗 *Link:* ${res.url}\n\n` +
                        `💖 Enjoy and be naughty responsibly~`;

        // Buttons
        const buttons = [
            {
                buttonId: `${prefix}nsfwmenu`,
                buttonText: { displayText: 'NSFW Menu ' }, 
                type: 1 
            },
            {
                buttonId: `${prefix}shorts ${query}`,
                buttonText: { displayText: 'Next' }, 
                type: 1 
            }
        ];

        // 3. SAFE VIDEO SENDING (Buffer Method)
        // First, we download the video inside the code
        try {
            const videoBuffer = await axios.get(res.url, { 
                responseType: 'arraybuffer',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });

            // If download is successful, then send it
            await Miku.sendMessage(m.from, { 
                video: videoBuffer.data, // Buffer instead of direct URL
                caption: caption,
                footer: `*${botName}*`,
                buttons: buttons,
                headerType: 5
            }, { quoted: m });

        } catch (videoError) {
            // 4. FALLBACK (If download fails or ISP blocks it)
            console.log("Video stream failed, switching to image...");
            
            // Proxy Image
            const proxyThumb = `https://sten-x-nsfw-api.vercel.app/api/proxy?url=${encodeURIComponent(res.thumbnail)}`;
            
            await Miku.sendMessage(m.from, { 
                image: { url: proxyThumb },
                caption: caption + "\n\n⚠️ *Uh-oh! Video blocked by ISP 😿 Use the link above instead.*",
                footer: `*${botName}*`,
                buttons: buttons,
                headerType: 4
            }, { quoted: m });
        }

    } catch (e) {
        console.error("Main API Error:", e);
        m.reply("❌ Server is feeling shy right now 🫣 Try again later!");
    }
  }
};