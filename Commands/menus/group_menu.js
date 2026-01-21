// menus/group_menu.js
module.exports = {
  name: "group_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ GROUP category ke commands nikalo
    let groupCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return cat === "GROUP" || cat === "ADMIN" || cat === "GROUP TOOLS";
      });

    if (!groupCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Group/Admin commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = groupCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: GROUP / ADMIN*

*${listText}*

*What is this?*  
These commands help you manage groups smoothly.

*How to use:*  
Type *"${prefix}commandname"*

*Admin Tips:*  
• Use wisely to keep group safe  
• Only admins can use most of these  
• Perfect for moderation & control
`;

    // 3️⃣ Rows for interactive list
    let rows = groupCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Group / admin command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — informative but simple
        title: `
*GROUP COMMANDS — ${pushName}*

*Bot:* ${botName}  
*Section:* Admin & Group Management  
*Total Commands:* ${groupCommands.length}

Control your group like a pro 😎
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Group Commands*",
              button_title: "Open Group Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Group Command",
                sections: [
                  {
                    title: "GROUP / ADMIN COMMANDS",
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