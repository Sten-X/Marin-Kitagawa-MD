const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" });

module.exports = {
  name: "aiimage",
  alias: ["aipic", "aigen", "imgai"],
  desc: "Generate AI image from text 🎨",
  category: "Search",
  usage: "aiimage <prompt>",
  react: "🖼️",

  start: async (Miku, m, { text, pushName }) => {
    if (!text)
      return Miku.sendMessage(
        m.from,
        {
          text: `🎨 Hey ${pushName}-chan~ I'm  your AI artist by *Sten-X*!  
Describe what you want me to draw ✨  
Example: .aiimage anime fox with neon lights in the background`,
        },
        { quoted: m }
      );

    await Miku.sendMessage(m.from, { text: `🧠 Creating your artwork... please wait 💫` }, { quoted: m });

    try {
      const promptGen = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "I'm an imaginative AI",
          },
          { role: "user", content: text },
        ],
      });

      const prompt = encodeURIComponent(promptGen.choices[0].message.content);
      const imageUrl = `https://image.pollinations.ai/prompt/${prompt}`;

      await Miku.sendMessage(
        m.from,
        {
          image: { url: imageUrl },
          caption: `*🎀『 ${botName} AI Art Studio 』*\n\n🧠 *Prompt:* ${text}\n🎨 Here's your masterpiece! ✨\n\n💫 *Created by Sten-X*`,
          footer: `Powered by *© ${botName}*`,
        },
        { quoted: m }
      );
    } catch (err) {
      await Miku.sendMessage(m.from, { text: `⚠️ Error: ${err.message}` }, { quoted: m });
    }
  },
};