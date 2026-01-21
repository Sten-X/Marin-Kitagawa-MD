const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial",
    "Verdana",
    "Impact",
    "Tahoma",
    "Georgia",
    "Trebuchet MS",
    "Courier New",
    "Comic Sans MS"
]

module.exports = {
    name: "glitch",
    alias: ["glt"],
    desc: "Make text logo.",
    react: "🍁",
    category: "Logo Maker",

    start: async (Miku, m, { prefix, text}) => {
        if (!text) return m.reply(`Example: *${prefix}glitch Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM TECH/GLITCH BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const queries = ["technology", "glitch", "cyberpunk", "neon"]
            const query = queries[Math.floor(Math.random() * queries.length)]
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & NEON COLORS ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            const neonColors = ["#ff00ff", "#00ffff", "#ff3300", "#33ff99", "#ffff00"]
            const color1 = neonColors[Math.floor(Math.random() * neonColors.length)]
            const color2 = neonColors[Math.floor(Math.random() * neonColors.length)]
            const textSize = Math.floor(Math.random() * 20) + 80 // 80-100px
            ctx.font = `bold ${textSize}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- Glitch Effect (RGB shift layers) ---
            const shiftAmount = 8
            ctx.fillStyle = color1
            ctx.fillText(text, x - shiftAmount, y)
            ctx.fillStyle = color2
            ctx.fillText(text, x + shiftAmount, y)

            // --- Neon Glow Main Text ---
            ctx.shadowColor = "#ffffff"
            ctx.shadowBlur = 50
            ctx.fillStyle = "#ffffff"
            ctx.fillText(text, x, y)

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
            m.reply("Error while generating logo.")
        }
    }
}
