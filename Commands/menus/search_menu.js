// menus/search_menu.js
module.exports = {
  name: "search_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ SEARCH category ke commands nikalo
    let searchCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return (
          cat === "SEARCH" ||
          cat === "TOOLS" ||
          cat === "FINDER" ||
          cat === "LOOKUP"
        );
      });

    if (!searchCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Search commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = searchCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: SEARCH / FINDER*

*${listText}*

*What is this?*  
Find anything quickly — from info to links and results.

*How to use:*  
Type *"${prefix}commandname"*

*Search Tips:*  
• Be specific for better results  
• Use keywords smartly  
• Perfect for quick answers 🔍
`;

    // 3️⃣ Rows for interactive list
    let rows = searchCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Search command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — informative + clean
        title: `
*SEARCH COMMANDS — ${pushName}*

*Bot:* ${botName}  
*Section:* Smart Search Tools  
*Total Commands:* ${searchCommands.length}

Find what you need in seconds ⚡
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Search Commands*",
              button_title: "Open Search Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Search Command",
                sections: [
                  {
                    title: "SEARCH COMMANDS",
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