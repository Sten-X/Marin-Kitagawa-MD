const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: "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" });

module.exports = {
  name: "codefix",
  alias: ["fixcode", "debugai", "codeai"],
  desc: "Fix or improve your code 💻",
  category: "Search",
  usage: "codefix <your code>",
  react: "⚙️",

  start: async (Miku, m, { text, pushName }) => {
    if (!text)
      return Miku.sendMessage(
        m.from,
        {
          text: `Hi ${pushName}-chan! 🧠 I'm your code buddy created by *Sten-X*.  
Send me some code — I'll fix and explain it! `,
        },
        { quoted: m }
      );

    await Miku.sendMessage(m.from, { text: `🔍 Debugging your code... please wait 🧩` }, { quoted: m });

    try {
      const chat = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "I'm an expert coding AI created by *Sten-X*. Fix syntax errors, improve readability, and explain changes clearly.",
          },
          { role: "user", content: text },
        ],
      });

      const reply = chat.choices[0].message.content;

      await Miku.sendMessage(
        m.from,
        {
          text: `*💻『 ${botName} CodeFix 』*\n\n🧩 *Result:*\n${reply}`,
          footer: `Powered by *© ${botName}*`,
        },
        { quoted: m }
      );
    } catch (err) {
      await Miku.sendMessage(m.from, { text: `⚠️ Error: ${err.message}` }, { quoted: m });
    }
  },
};