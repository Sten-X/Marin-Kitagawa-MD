const ttt = require('google-tts-api');

module.exports = {
    name: "say",
    alias: ["sayenglish","texttospeech","tts"],
    desc: "Say something cutely using the bot.",
    usage: "say <text>",
    react: "🍁",
    category: "Essentials",
    start: async (Miku, m, { pushName, prefix, args, text }) => {
        let message;

        if (!text && m.quoted) {
            message = m.quoted?.msg || '';
        } else if (args[0]) {
            message = args.join(' ');
        } else {
            message = `Please provide me a text to say, ${pushName}-san!~ ☆`;
        }

        // Add kawaii flavor by appending some cute suffixes if not empty
        if (message.trim()) {
            message += "";
        }

        // Use Japanese voice for kawaii effect or gentle English voice
        // lang: 'ja' for Japanese, or 'en-US' for soft English accent
        // slow: true makes voice slower & softer
        const texttospeechurl = ttt.getAudioUrl(message, {
            lang: "en",   // you can switch to "en" or "en-US" if you want English
            slow: true,
            host: "https://translate.google.com",
        });

        try {
            await Miku.sendMessage(
                m.from,
                { audio: { url: texttospeechurl }, mimetype: "audio/mpeg" },
                { quoted: m }
            );
        } catch (e) {
            m.reply(`An error occurred! Sorry, ${pushName}-san.`);
        }
    }
};
