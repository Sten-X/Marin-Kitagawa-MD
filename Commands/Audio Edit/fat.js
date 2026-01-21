const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "fat",
  alias: ["fateffect"],
  desc: "Make audio sound fat & punchy 🎶",
  category: "Audio Edit",
  usage: "fat <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ check if reply is audio
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `🧣 Konichiwa *${pushName}-chan*!  
Please reply to an *audio file* so I can make it sound *fat & powerful~ 🔊*  

✨ Example:
> *${prefix}fat* (reply to an audio)  

💡 Tip: Best used on vocals or beats for a chunky vibe 💥`
        );
      }

      // 2️⃣ download input audio
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😭 Please retry~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 3️⃣ ffmpeg filter (fat effect)
      let set = `-filter:a "atempo=1.6,asetrate=44100*1.2"`;  
      // 🔥 this makes audio thicker & slightly faster

      await m.reply(
        `⏳ Processing *Fat Effect* for you, ${pushName}-chan 💥  
Suzume MD is making your audio sound *chunky & heavy~ 🔊*`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying fat effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Suzume.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *Fat Effect track* ${pushName}-chan 🔊💥  

Powered by: 🎀 *${botName}* 🎀  

💡 Tip: Try combining this with *deep* or *blown* for unique vibes 🎶`
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