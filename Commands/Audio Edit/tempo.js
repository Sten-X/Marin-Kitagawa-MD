const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { getRandom } = require("../../lib/myfunc");

module.exports = {
  name: "tempo",
  alias: ["tempoeffect"],
  desc: "🎶 Change the tempo of a song",
  category: "Audio Edit",
  usage: "tempo <reply to audio>",
  react: "🍁",

  start: async (Miku, m, { quoted, mime, pushName, prefix }) => {
    try {
      // ✅ Check if replied to audio
      if (!quoted || !/audio/.test(mime)) {
        return m.reply(
          `Hey *${pushName}-chan*!  
Please reply to an *audio file* so I can apply *tempo effect* 🎶  

💡 Example: *${prefix}tempo* (reply to an audio)`
        );
      }

      // ✅ Download input
      let media = await Miku.downloadAndSaveMediaMessage(quoted);
      if (!media || !fs.existsSync(media)) {
        return m.reply("❌ Couldn't download the audio file 😿 Try again~");
      }

      let ran = getRandom(".mp3");
      let outputPath = path.resolve(ran);

      // 🎚️ Tempo effect (speed slightly changed)
      // atempo = playback speed, asetrate = pitch handling
      let set = `-af "atempo=0.9,asetrate=65100"`;  

      await m.reply(
        `⏳ Applying *Tempo Effect* for you, ${pushName}-chan 🎶  
Please wait while I make your audio sound cooler 😎✨`
      );

      // ✅ Run ffmpeg
      exec(`ffmpeg -y -i "${media}" ${set} "${outputPath}"`, async (err) => {
        if (fs.existsSync(media)) fs.unlinkSync(media);

        if (err) {
          console.error(err);
          return m.reply("❌ Oops! Error while applying tempo effect 😭");
        }

        try {
          let buff = fs.readFileSync(outputPath);
          await Miku.sendMessage(
            m.from,
            { audio: buff, mimetype: "audio/mpeg" },
            { quoted: m }
          );

          await m.reply(
            `✅ Done~ Here’s your *Tempo Edited Audio* ${pushName}-chan 🎶✨  

🧣 Effect applied: *Playback speed adjusted (tempo)*  
💡 Use this to make tracks sound *slightly faster or slower*! 🔊`
          );
        } catch (e) {
          console.error(e);
          m.reply("❌ Failed to send audio 😿");
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