const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "deep",
  alias: ["deepeffect"],
  desc: "Add a deep reverb/bass effect to a song 🎶",
  category: "Audio Edit",
  usage: "deep <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ check if reply is audio
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Konichiwa *${pushName}-chan*!  
Please reply to an *audio file* so I can make it sound *deep & echoey~ 🎶*  

✨ Example:
> *${prefix}deep* (reply to an audio)  

💡 Tip: Try this on slow songs for a dramatic deep vibe 💖`
        );
      }

      // 2️⃣ download input audio
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😭 Please retry~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 3️⃣ ffmpeg filter (deep effect)
      let set = `-af atempo=0.9,asetrate=44100*0.8`;

      await m.reply(
        `⏳ Processing *Deep Effect* for you, ${pushName}-chan 💜  
🎀 *${botName}* 🎀 is adding *low & heavy reverb vibes*... 🎧`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying deep effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Suzume.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *Deep Effect track* ${pushName}-chan 🎶💜  

Powered by: 🎀 *${botName}* 🎀  

💡 Tip: Use this with nightcore for cool contrast 🔥`
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