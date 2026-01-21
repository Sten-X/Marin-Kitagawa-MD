const { proto } = require("@adiwajshing/baileys");

module.exports = {
    name: "owner",
    alias: ["creator", "dev", "developer", "stenx", "author"],
    desc: "Display bot owner information securely",
    category: "General",
    react: "🎀", 

    start: async (Miku, m, { prefix, pushName }) => {
        
        // 🔒 HARDCODED OWNER DETAILS
        const ownerName = "Sten-X";             
        const ownerNumber = "918434573266";     // Apka number
        const orgName = "Web Universe "; 
        const githubLink = "https://github.com/Sten-X";
        const email = "rajdevorcreator@gmail.com";      
        const bio = "I turn coffee into code and bugs into features! ";

        // 📇 vCard Logic
        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName} 〽️\n` +
                      `ORG:${orgName};\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` + 
                      `EMAIL:${email}\n` +
                      `URL:${githubLink}\n` +
                      'item1.URL:https://github.com/Sten-X\n' +
                      'item1.X-ABLabel:GitHub \n' +
                      'END:VCARD';

        // 🌸 Cute & Stylish Caption
        let caption = `
╭━━━ *OWNER PROFILE* ━━━╮
┃
┃ 💫 *Name:* ${ownerName}
┃ 👑 *Title:* Creator of Marin Kitagawa
┃
┃ 〽️ *Bio:* _${bio}_
┃
┃  *GitHub:* Sten-X
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━ 🎀 *CONNECT WITH ME* 🎀 ━━━╮
┃
┃ 📩 *Reach out for:*
┃  • 🐛 Bug Reports
┃  • ✨ Feature Requests
┃  • 🤝 Collaboration
┃
┃ ⚠️ *Warning:*
┃ _Please do not spam calls!__
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

        // ✅ STEP 1: Send Stylish Text/Image First
        // Hum 'image' bhejenge agar global.botImage1 defined hai, nahi to 'text'
        
        try {
            await Miku.sendMessage(m.from, {
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Senpai! Meet My Creator ",
                        body: "Code crafted with ❤️ by Sten-X",
                        thumbnailUrl: global.botImage1,
                        sourceUrl: githubLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        } catch (err) {
            // Agar Image load nahi hui to fallback Text bhejega
            await Miku.sendMessage(m.from, {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ Senpai! Meet My Creator ✨",
                        body: "Code crafted with ❤️ by Sten-X",
                        sourceUrl: githubLink,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        }

        // ✅ STEP 2: Send Contact Card Separately
        // Thoda sa delay taaki sequence sahi rahe
        await new Promise(r => setTimeout(r, 500));
        
        await Miku.sendMessage(m.from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });
    }
};