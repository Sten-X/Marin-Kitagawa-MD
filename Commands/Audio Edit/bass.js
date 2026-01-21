const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "bass",
  alias: ["bassboost", "bassy"],
  desc: "Apply kawaii bass boost effect to an audio file 🎶",
  category: "Audio Edit",
  usage: "bass <level> (reply to audio)",
  react: "🍁",

  start: async (Miku, m, { text, quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ Check audio reply
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Konichiwa *${pushName}-chan*!  
Please reply to an *audio file* so *${botName}* can add kawaii bass boost 🎶  

✨ Example:
> *${prefix}bass* (Default boost)  
> *${prefix}bass 20* (Custom boost)  

💡 Tip: Higher number = more bass 🔊🔥`
        );
      }

      // 2️⃣ Bass level (with default + chart)
      let level;
      if (!text) {
        level = 14; // default

        // show chart before processing
        await m.reply(
          `💖 Haii *${pushName}-chan*!  
You didn’t choose a level, so I’ll use *Default 14 dB Bass Boost*

🎶 Bass Boost Levels *${botName}*:
0–10 ➝ Light ✨ (soft & clean sound)  
14 ➝ Default 💖 (balanced, punchy bass)  
20 ➝ Strong 🔥 (club/party feel)  
25 ➝ Extreme 🎉 (heavy headphones thump)  
30 ➝ Ultra 🚨 (may distort audio!)  

💡 Next time try: *${prefix}bass 20*`
        );
      } else {
        level = isNaN(text) ? 14 : Math.min(parseInt(text), 30);
      }

      // 3️⃣ Download media
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Failed to fetch audio file! Please try again~ 😭");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 4️⃣ ffmpeg filter
      let set = `-af equalizer=f=54:width_type=o:width=2:g=${level}`;

      await m.reply(
        `⏳ Working on it *${pushName}-chan*...  
*${botName}* is adding *${level} dB Bass Boost* to your track 🎧💫`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while boosting bass 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Miku.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Yay! All done *${pushName}-chan* 💖  
Here’s your kawaii bass boosted track 🎶  

 Powered by: 🎀 *${botName}* 🎀   

💡 Tip: Try *${prefix}bass 25* for party vibes 🎉🔥`
          );
        } catch (e) {
          console.error(e);
          m.reply("❌ Failed to send the audio nya~ 😢");
        } finally {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      });
    } catch (e) {
      console.error(e);
      m.reply("⚠️ Please reply with a valid audio nya~ 🎵");
    }
  },
};