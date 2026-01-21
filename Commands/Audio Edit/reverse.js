const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "reverse",
  alias: ["reverseeffect"],
  desc: "Reverse any audio 🔄🎶",
  category: "Audio Edit",
  usage: "reverse <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ check if reply is audio
     if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Hey *${pushName}-chan*!  
Please reply to an *audio file* so I can make it play *backwards~ 🔄🎶*  

✨ Example:
> *${prefix}reverse* (reply to an audio)`
        );
      }

      // 2️⃣ download input audio
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't fetch the audio file 😭 Please retry~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 3️⃣ ffmpeg filter (reverse effect)
      let set = `-filter_complex "areverse"`;  

      await m.reply(
        `⏳ Processing *Reverse Effect* for you, ${pushName}-chan 🔄  
🎀 *${botName}* 🎀 is flipping your audio *backwards~ 🎶*`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying Reverse effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Suzume.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *Reversed track* ${pushName}-chan 🔄🎶  

Powered by: 🎀 *${botName}* 🎀  

💡 Reversed audio sounds funny & spooky 👻, try it on songs or voice notes!`
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