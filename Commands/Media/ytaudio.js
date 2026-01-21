const axios = require("axios");

module.exports = {
  name: "ytad",
  alias: ["mp3", "ytmp3", "ytaudio"],
  category: "Media",
  react: "🍁",

  start: async (Miku, m, { args, text, prefix }) => {

    const url = args[0] || text;

    if (!url) {
      return Miku.sendMessage(
        m.from,
        { text: `Example:\n${prefix}ytad https://youtube.com/watch?v=xxxx` },
        { quoted: m }
      );
    }

    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
      return Miku.sendMessage(
        m.from,
        { text: "❌ Please provide a valid YouTube link." },
        { quoted: m }
      );
    }

    try {
      await Miku.sendMessage(
        m.from,
        { text: "🎧 Fetching audio, please wait..." },
        { quoted: m }
      );

      // 🔊 AUDIO API
      const apiUrl =
        `http://157.173.113.252:3010/download/youtube/audio?url=` +
        encodeURIComponent(url);

      const response = await axios.get(apiUrl, { timeout: 60000 });
      const data = response.data;

      if (!data?.success || !data?.result?.download_url) {
        throw new Error("Audio API failed");
      }

      const { title, thumbnail, download_url } = data.result;

      // show preview
      await Miku.sendMessage(
        m.from,
        {
          image: { url: thumbnail },
          caption:
            `🎵 *Audio Found!*\n\n` +
            `📌 *Title:* ${title}\n\n` +
            `📥 Downloading audio...`
        },
        { quoted: m }
      );

      // stream audio
      const audioStream = await axios.get(download_url, {
        responseType: "stream",
      });

      const chunks = [];
      for await (const chunk of audioStream.data) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      await Miku.sendMessage(
        m.from,
        {
          audio: buffer,
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          ptt: false
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("YT AUDIO ERROR:", err);

      await Miku.sendMessage(
        m.from,
        {
          text:
            "💔 Audio server is busy right now.\n" +
            "Please try again after some time."
        },
        { quoted: m }
      );
    }
  },
};