// menus/logomaker_menu.js
module.exports = {
  name: "logomaker_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ LOGO MAKER category ke commands nikalo
    let logoCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return (
          cat === "LOGO" ||
          cat === "LOGO MAKER" ||
          cat === "LOGO TOOLS" ||
          cat === "TEXT LOGO"
        );
      });

    if (!logoCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Logo Maker commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = logoCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: LOGO MAKER*

*${listText}*

*What is this?*  
Create stylish logos, text designs, and name arts easily.

*How to use:*  
Type *"${prefix}commandname"*

*Design Tips:*  
• Try short names for better logos  
• Experiment with different styles  
• Perfect for YouTube, Insta, and gaming
`;

    // 3️⃣ Rows for interactive list
    let rows = logoCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Logo maker command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — informative
        title: `
*LOGO MAKER — ${pushName}*

*Bot:* ${botName}  
*Section:* Text & Graphic Design  
*Total Commands:* ${logoCommands.length}

Design your identity with style ✨
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Logo Maker Commands*",
              button_title: "Open Logo Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Logo Command",
                sections: [
                  {
                    title: "LOGO MAKER COMMANDS",
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