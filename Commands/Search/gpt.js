const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" }); // 👈 put your Groq key here

module.exports = {
  name: "aiask",
  alias: ["askai", "ask", "gpt"],
  desc: "Ask anything from AI 💭",
  category: "Search",
  usage: "aiask <your question>",
  react: "🍁",

  start: async (Miku, m, { text, pushName, prefix }) => {
    if (!text)
      return Miku.sendMessage(
        m.from,
        {
          text: `Konichiwa *${pushName}-chan*! 💬 I'm  *${botName}*, created by *Sten-X* 💻  
Ask me anything nya~ 💖  
Example: *${prefix}aiask Why is the sky blue?* 🌤️`,
        },
        { quoted: m }
      );

    try {
      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "I'm an intelligent, kind, anime-style assistant created by Sten-X. Use emojis and kawaii tone sometimes.",
          },
          { role: "user", content: text },
        ],
      });

      const reply = chat.choices[0].message.content;

      await Miku.sendMessage(
        m.from,
        {
          text: `*🎀『 ${botName} AI Chat 』*\n\n💬 *Answer:*\n${reply}`,
          footer: `Powered by *© ${botName}*`,
        },
        { quoted: m }
      );
    } catch (err) {
      await Miku.sendMessage(
        m.from,
        { text: `⚠️ Error: ${err.message}` },
        { quoted: m }
      );
    }
  },
};