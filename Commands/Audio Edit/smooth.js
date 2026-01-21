const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "smooth",
  alias: ["smootheffect"],
  desc: "Apply smooth filter to audio 🎶✨",
  category: "Audio Edit",
  usage: "smooth <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // ✅ Check if replied to audio
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Hey *${pushName}-chan*!  
Please reply to an *audio file* so I can make it sound *smoother 🎶✨*  

💡 Example: *${prefix}smooth* (reply to an audio)`
        );
      }

      // ✅ Download input
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😿 Please try again~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 🎚️ Smooth audio filter
      // Using lowpass + equalizer to soften harsh sounds
      let set = `-af "asetrate=44100, lowpass=f=3000, equalizer=f=1000:t=h:width=200:g=3"`;  

      await m.reply(
        `⏳ Applying *Smooth Effect* for you, ${pushName}-chan 🎶✨  
🎀 *${botName}* 🎀 is making your audio *softer & relaxing~ 🧣*`
      );

      // ✅ Run FFmpeg
      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! Error while applying smooth effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Miku.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✅ Done~ Here’s your *Smooth Audio* ${pushName}-chan 🎶✨  

🧣 Effect applied: *Low-pass + Equalizer*  
💡 This makes the audio *softer, warmer & smooth vibes~ 🔊*`
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