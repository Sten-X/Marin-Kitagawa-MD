const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "blown",
  alias: ["blowneffect"],
  desc: "Add a blown (distorted/crushed) effect to a song 🎶",
  category: "Audio Edit",
  usage: "blown <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // 1️⃣ check if audio reply
      if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Konichiwa *${pushName}-chan*!  
Please reply to an *audio file* so I can make it sound *blown & funny~ 🎶*  

✨ Example:
> *${prefix}blown* (reply to an audio)  

💡 Tip: Works best on songs with bass 🔊🔥`
        );
      }

      // 2️⃣ download media
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Failed to fetch audio file! Please try again~ 😭");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 3️⃣ ffmpeg blown effect filter
      let set = `-af acrusher=.1:1:40:0:log`;

      await m.reply(
        `⏳ Working on it *${pushName}-chan*...  
🎀 *${botName}* 🎀 is adding the *Blown Effect* 💥🎧  
Please wait a moment nya~ 🧣`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while adding blown effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Suzume.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Yay~ All done *${pushName}-chan* 💖  
Here’s your *kawaii blown effect track* 🎶💥  

 Powered by: 🎀 *${botName}* 🎀   

💡 Tip: Try this effect on memes for funny results 😆`
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