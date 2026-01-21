const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial", "Verdana", "Impact", "Tahoma", 
    "Georgia", "Trebuchet MS", "Courier New", "Comic Sans MS"
]

module.exports = {
    name: "pornhub",
    alias: ["ph"],
    desc: "Make Pornhub Style Text Logo",
    category: "Logo Maker",
    react: "🍁",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}pornhub Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM BACKGROUND (dark/gradient style) ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const query = "porn,sexygirl,nudegirl,girl,pussy,boobs,ass,xxx"
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- FONT & COLORS ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            ctx.font = `bold 120px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- Pornhub style: black + orange block ---
            const textParts = text.split(" ")
            const mainText = textParts.slice(0, -1).join(" ") || text
            const blockText = textParts.slice(-1).join(" ")

            // Draw black part
            ctx.fillStyle = "#000000"
            ctx.fillText(mainText, x - 60, y)

            // Draw orange block part
            ctx.fillStyle = "#FF9900"
            ctx.fillRect(x + 10, y - 60, ctx.measureText(blockText).width + 20, 100)

            // Orange text inside block
            ctx.fillStyle = "#000000"
            ctx.fillText(blockText, x + 20, y)

            // --- SEND IMAGE ---
            const buffer = canvas.toBuffer("image/png")
            await Miku.sendMessage(
                m.from,
                {
                    image: buffer,
                    caption: `Made by *${botName}*`
                },
                { quoted: m }
            )

        } catch (err) {
            console.error(err)
            m.reply("Error while generating Pornhub logo.")
        }
    }
}
