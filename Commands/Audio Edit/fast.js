const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "fast",
  alias: ["fastaudio", "speedup"],
  desc: "Speed up audio like a chipmunk 🎵⚡",
  category: "Audio Edit",
  usage: "fast <speed> (reply to audio)",
  react: "⚡",

  start: async (Miku, m, { quoted, mime, text, pushName, prefix }) => {
    try {
      // 1️⃣ Reply check
      if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Hey *${pushName}-chan*!  
Please reply to an *audio file* to make it sound *faster ⚡🎶*  

✨ Example:
> *${prefix}fast* (Default 1.5x speed)  
> *${prefix}fast 2* (Chipmunk mode 🐿️)

💡 Tip: Higher number = faster sound!  
Recommended range: 1.2 – 3.0`
        );
      }

      // 2️⃣ Speed level (tempo)
      let tempo;
      if (!text) {
        tempo = 1.5; // default
        await m.reply(
          `Haii *${pushName}-chan*!  
You didn’t choose a speed, so I’ll use *Default 1.5x speed ⚡*  

🎵 Fast Levels Guide:
> 1.2x ➝ Light Fast ✨  
> 1.5x ➝ Energetic ⚡ (default)  
> 2.0x ➝ Chipmunk 🐿️  
> 2.5x ➝ Hyper Mode 🚀  
> 3.0x ➝ Ultra Zoom 💥

💡 Try *${prefix}fast 2* for meme vibes!`
        );
      } else {
        const num = parseFloat(text);
        if (isNaN(num) || num < 1.2 || num > 3.0) {
          return m.reply("❌ Invalid speed! Please enter a number between 1.2 and 3.0 ⚡");
        }
        tempo = Math.min(3.0, Math.max(1.2, num));
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
        `⏳ Applying *${tempo}x Fast Effect* for you, ${pushName}-chan ⚡  
🎀 *${botName}* 🎀 is transforming your audio into a *super fast version~ 🎶*`
      );

      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! FFmpeg error while applying Fast effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Miku.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✨ Done~ Here’s your *${tempo}x faster track* ${pushName}-chan ⚡🎶  

Powered by: 🎀 *${botName}* 🎀  

💡 This effect adds energy, chipmunk voice, & meme fun 🔊`
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
