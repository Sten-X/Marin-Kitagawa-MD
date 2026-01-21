// menus/weeb_menu.js
module.exports = {
  name: "weeb_menu",

  start: async (sock, m, { prefix, commands, pushName }) => {

    // 1️⃣ WEEB / ANIME category ke commands nikalo
    let weebCommands = [...commands.values()]
      .filter(cmd => {
        let cat = (cmd.category || "").toUpperCase();
        return (
          cat === "WEEB" ||
          cat === "ANIME" ||
          cat === "ANIMEE" ||
          cat === "WEEB TOOLS"
        );
      });

    if (!weebCommands.length) {
      return sock.sendMessage(
        m.from,
        { text: "❌ No Weeb / Anime commands found." },
        { quoted: m }
      );
    }

    // 2️⃣ Command list text
    let listText = weebCommands
      .map((cmd, i) => `🔹 ${i + 1}. ${cmd.name}`)
      .join("\n");

    let textHelpMenu = `
🕯️✨ *${botName}* ✨🕯️

*📌 CATEGORY: WEEB / ANIME*

*${listText}*

*What is this?*  
Everything for anime lovers — waifu, quotes, cosplay & more.

*How to use:*  
Type *"${prefix}commandname"*

*Otaku Tips:*  
• Use waifu commands for fun  
• Try anime quotes for status  
• Explore wallpapers & cosplay
`;

    // 3️⃣ Rows for interactive list
    let rows = weebCommands.map(cmd => ({
      title: cmd.name.toUpperCase(),
      description: cmd.desc || "Weeb / anime command",
      id: `${prefix}${cmd.name}`
    }));

    // 4️⃣ Interactive message
    await sock.sendMessage(m.from, {
      interactiveMessage: {

        // TITLE — informative + anime vibe
        title: `
*WEEB COMMANDS — ${pushName}*

*Bot:* ${botName}  
*Section:* Anime & Otaku Zone  
*Total Commands:* ${weebCommands.length}

Welcome to the world of anime ✨
`,

        footer: `Powered by *© ${botName}*`,

        nativeFlowMessage: {

          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 10,
              list_title: "*Weeb Commands*",
              button_title: "Open Weeb Menu"
            }
          }),

          buttons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Select Weeb Command",
                sections: [
                  {
                    title: "WEEB / ANIME COMMANDS",
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