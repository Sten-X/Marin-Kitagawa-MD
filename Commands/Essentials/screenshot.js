const puppeteer = require('puppeteer');

module.exports = {
    name: "screenshot",
    alias: ["ss"],
    desc: "Take a full-page screenshot of a website.",
    usage: "ss <link>",
    react: "🍁",
    category: "Essentials",
    start: async (Miku, m, { args }) => {
        if (!args[0]) return m.reply(`Please provide me a link!`);

        let lookupURL = args[0].startsWith("http") ? args[0] : `https://${args[0]}`;

        try {
            new URL(lookupURL);
        } catch {
            return m.reply(`Invalid URL! Please enter a valid URL.`);
        }

        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.goto(lookupURL, { waitUntil: 'networkidle2' });
            
            // Puppeteer se raw screenshot data le rahe hain
            const screenshotRaw = await page.screenshot({ fullPage: true });
            // Use Buffer.from to ensure its a Buffer instance
            const screenshotBuffer = Buffer.from(screenshotRaw);

            await browser.close();

            if (!Buffer.isBuffer(screenshotBuffer)) {
                throw new Error("Screenshot buffer invalid");
            }

            await Miku.sendMessage(
                m.from,
                { image: screenshotBuffer, caption: `Here's a full-page screenshot of:\n${lookupURL}` },
                { quoted: m }
            );
        } catch (error) {
            console.error("Screenshot Error:", error);
            m.reply(`Failed to take screenshot. Please try again later.`);
        }
    }
}