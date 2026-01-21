// menus/fun_menu.js
module.exports = {
  name: "fun_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ FUN category ke commands nikalo
    let funCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return cat === "FUN" || cat === "ENTERTAINMENT" || cat === "GAMES";
      });

    if (!funCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Fun commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = funCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: FUN*

*${listText}*

*What is this?*  
This section is all about jokes, games, and time-pass commands.

*How to use:*  
Type *"${prefix}commandname"*

*Fun Tips:*  
• Use these to chill with friends  
• Perfect for group chats  
• Best way to remove boredom 😄
`;

    // 3️⃣ Rows for interactive list
    let rows = funCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Fun / entertainment command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message (same structure)
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — thoda informative
        title: `
*FUN COMMANDS — ${pushName}*

*Bot:* ${botName}  
*Section:* Games & Entertainment  
*Total Commands:* ${funCommands.length}

Have fun and enjoy your time here 🎉
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Fun Commands*",
              button_title: "Open Fun Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Fun Command",
                sections: [
                  {
                    title: "FUN COMMANDS",
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