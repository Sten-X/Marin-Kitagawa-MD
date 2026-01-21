const { reg } = require("../../Database/dataschema.js");

module.exports = {
  name: "register",
  alias: ["reg", "signup"],
  desc: "Cute interactive registration for Economy, RPG & Card system.",
  category: "Core",
  react: "🎗️",
  start: async (Miku, m, { prefix }) => {

    let user = await reg.findOne({ id: m.sender });

    // already registered
    if (user && user.registered) {
      return Miku.sendMessage(
        m.from,
        {
          text: `〽️Konnichiwa" (こんにちは)~ *${m.pushName}* senpai, you are already registered nya~ \n\nYou can freely use all features of *${botName}* now~`,
        },
        { quoted: m }
      );
    }

    // set / reset step to name
    await reg.updateOne(
      { id: m.sender },
      { step: "name" },
      { upsert: true }
    );

    return Miku.sendMessage(
      m.from,
      {
        text: `✨ *Yosh, let's start registration senpai!*~ \n\nPlease send your *Name* first nya~\n\nExample:\n➤ *Sten-X*\n\nAfter this I'll ask your Age, Gender & Region one by one 💫\n\n-  Your cute assistant, *${botName}* `,
      },
      { quoted: m }
    );
  },
};