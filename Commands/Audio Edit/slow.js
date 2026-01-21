const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "slow",
  alias: ["sloweffect"],
  desc: "Add slow motion effect to audio 🐌🎶",
  category: "Audio Edit",
  usage: "slow <level> (reply to audio)",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, text, pushName, prefix }) => {
    try {
      // 1️⃣ Reply check
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Hey *${pushName}-chan*!  
Please reply to an *audio file* to make it sound *slower 🐌🎶*  

✨ Example:
> *${prefix}slow* (Default 0.8x slow)  
> *${prefix}slow 0.5* (More chill 🧊)  

💡 Tip: Lower number = more slow.  
Recommended range: 0.3 – 0.9`
        );
      }

      // 2️⃣ Slow level (tempo)
      let tempo;
      if (!text) {
        tempo = 0.8; // default
        await m.reply(
          `Haii *${pushName}-chan*!  
You didn’t choose a slow level, so I’ll use *Default 0.8x speed 🐌*  

🎵 Slow Levels Guide:
> 0.9x ➝ Light Slow ✨  
> 0.8x ➝ Chill Mood 🌙 (default)  
> 0.6x ➝ Deep Relax 🛌  
> 0.4x ➝ Trippy 😵‍💫  
> 0.3x ➝ Ultra Slow 🐢  

💡 Tip: Try *${prefix}slow 0.5* for lofi vibes!`
        );
      } else {
        const num = parseFloat(text);
        if (isNaN(num) || num <= 0 || num > 1.5) {
          return m.reply("❌ Invalid level! Please enter a number between 0.3 and 1.5 🐌");
        }
        tempo = Math.max(0.3, Math.min(num, 1.5)); // Clamp between 0.3–1.5
      }

      // 3️⃣ Download input audio
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😭 Please retry~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 4️⃣ FFmpeg filter
      let set = `-filter:a "atempo=${tempo},asetrate=44100"`;

      await m.reply(
        `⏳ Applying *${tempo}x Slow Effect* for you, ${pushName}-chan 🐌  
🎀 *${botName}* 🎀 is transforming your audio into a *chill slow version~ 🎶*`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying Slow effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Miku.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *${tempo}x slowed track* ${pushName}-chan 🐌🎶  

Powered by: 🎀 *${botName}* 🎀  

💡 This effect gives your audio a *relaxed, deep, or lofi feel 🔊*`
          );
        } catch (e) {
          console.error(e);
          m.reply("❌ Failed to send audio nya~ 😿");
        } finally {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      });
    } catch (e) {
      console.error(e);
      m.reply("⚠️ Please reply with a valid audio file nya~ 🎵");
    }
  },
};
