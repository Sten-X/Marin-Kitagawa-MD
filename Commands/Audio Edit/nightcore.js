const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "nightcore",
  alias: ["nightcoreeffect"],
  desc: "Make audio sound Nightcore style 🌙🎶",
  category: "Audio Edit",
  usage: "nightcore <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ check if reply is audio
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `🧣 Konichiwa *${pushName}-chan*!  
Please reply to an *audio file* so I can make it sound *Nightcore style~ 🌙🎶*  

✨ Example:
> *${prefix}nightcore* (reply to an audio)  

💡 Nightcore = Faster tempo + Higher pitch ✨`
        );
      }

      // 2️⃣ download input audio
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😭 Please retry~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 3️⃣ ffmpeg filter (Nightcore effect)
      let set = `-filter:a "atempo=1.07,asetrate=44100*1.20"`;  

      await m.reply(
        `⏳ Processing *Nightcore Effect* for you, ${pushName}-chan 🌙  
🎀 *${botName}* 🎀 is making your audio sound *cute & fast~ 🎶*`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying Nightcore effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Suzume.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *Nightcore track* ${pushName}-chan 🌙🎶  

Powered by: 🎀 *${botName}* 🎀  

💡 Try this on slow songs — they turn into anime vibes instantly! 💕`
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