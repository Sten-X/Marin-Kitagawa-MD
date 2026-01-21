const axios = require("axios");

module.exports = {
  name: "igdl",
  alias: ["instagram", "instadl", "instagramdl", "ig", "insta"],
  desc: "To download an Instagram video or image (Powered by Marin-MD API) 🧣🥰",
  category: "Media",
  usage: `igdl <video|image link>`,
  react: "🍁",
  start: async (Miku, m, { text, prefix, args}) => {

    // 💡 Cute tip if no link provided
    if (!args[0])
      return Miku.sendMessage(
        m.from,
        { text: `Oops! You forgot to provide a link!\nUsage: ${prefix}igdl <Instagram Video/Image link>` },
        { quoted: m }
      );

    // ❌ Invalid link message with cute words
    if (!args[0].includes("instagram.com"))
      return Miku.sendMessage(
        m.from,
        { text: `⚠️ Hmm... That doesn't look like a valid Instagram link, cutie! 😅` },
        { quoted: m }
      );

    // Link Cleaning
    let InstaLink = args[0];
    if (InstaLink.includes("?")) InstaLink = InstaLink.split("?")[0];

    // ⏳ Loading Message
    await Miku.sendMessage(
      m.from,
      { text: `⏳ Hold on Senpai I'm fetching your Instagram media... 💖` },
      { quoted: m }
    );

    try {
        // 🔥 Using Vercel API instead of Cookies
        const apiUrl = `https://sten-x-nsfw-api.vercel.app/api/insta?url=${args[0]}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status) {
            return Miku.sendMessage(
                m.from,
                { text: `❌ Oops! Could not fetch media. Maybe it's private or the link is wrong 😢` },
                { quoted: m }
            );
        }

        const mediaList = data.result.media; // Array of URLs
        const count = data.result.media_count;

        // Loop through all media (Works for single and album both)
        for (let i = 0; i < count; i++) {
            let fileUrl = mediaList[i];
            
            // 🧠 Smart Type Detection (Kyunki API strings return karti hai)
            let isVideo = fileUrl.includes(".mp4") || fileUrl.includes("/video/") || fileUrl.includes("fbcdn.net/v/");

            if (isVideo) {
                // VIDEO MESSAGE 🎬
                await Miku.sendMessage(
                    m.from,
                    {
                        video: { url: fileUrl },
                        caption: count > 1 
                            ? `🎬 Video ${i+1} downloaded by *${botName}* 💖\nTip: Enjoy your Insta reel, cutie!`
                            : `🎬 Yay! Your video has been downloaded by *${botName}* 💖\nTip: You can save it or share with friends! ✨`
                    },
                    { quoted: m }
                );
            } else {
                // IMAGE MESSAGE 🖼️
                await Miku.sendMessage(
                    m.from,
                    {
                        image: { url: fileUrl },
                        caption: count > 1
                            ? `Image ${i+1} downloaded by *${botName}* 💖\nTip: Share your cute pics with friends! ✨`
                            : `Aww~ Cute image downloaded by *${botName}* 💖\nTip: Forward it to your friends or set as wallpaper! 😍`
                    },
                    { quoted: m }
                );
            }
        }

    } catch (error) {
        console.error("IG Error:", error);
        Miku.sendMessage(
            m.from, 
            { text: `❌ Server Error! My systems are overwhelmed. Try again later! 🧣` }, 
            { quoted: m }
        );
    }
  }
};