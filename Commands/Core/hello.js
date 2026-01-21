module.exports = {
    name: "hi",
    alias: ["hello"],
    desc: "Say hello to bot.",
    react: "🧣",
    category: "Core",
    start: async(Miku, m,{pushName,prefix}) => {
        await Miku.sendMessage(m.from,{text:`ᴋᴏɴɪᴄʜɪᴡᴀ *${pushName}* ꜱᴇɴᴘᴀɪ, ɪ ᴀᴍ *${botName}* ʙᴏᴛ. ᴛʏᴘᴇ *${prefix}ʜᴇʟᴘ* ᴛᴏ ɢᴇᴛ ᴍʏ ғᴜʟʟ ᴄᴏᴍᴍᴀɴᴅ ʟɪꜱᴛ.`},{quoted:m})
    }
}
