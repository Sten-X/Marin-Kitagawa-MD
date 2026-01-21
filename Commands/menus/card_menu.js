// menus/card_menu.js
module.exports = {
  name: "card_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ CARD category ke commands nikalo
    let cardCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return cat === "CARD" || cat === "CARDS" || cat === "CARD SYSTEM";
      });

    if (!cardCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Card commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = cardCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: CARD SYSTEM*

*${listText}*

*How to use:*  
Type *"${prefix}commandname"*

*Tips:*  
• Collect cards daily to grow your deck  
• Use trade/gift commands to exchange cards  
• Check your collection regularly
`;

    // 3️⃣ Rows for interactive list
    let rows = cardCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Card system command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — clean + informative
        title: `
*CARD SYSTEM COMMANDS — ${pushName}*

*Bot:* ${botName}  
*Section:* Card & Collection System  
*Total Commands:* ${cardCommands.length}  

Use this menu to manage cards, trades and collections.
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Card Commands*",
              button_title: "Open Card Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Card Command",
                sections: [
                  {
                    title: "CARD SYSTEM COMMANDS",
                    rows
                  }
                ]
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "⬅ Back to Menu",
                id: `${prefix}help`
              })
            }
          ]

        }

      },

      caption: textHelpMenu

    }, { quoted: m });

  }
};