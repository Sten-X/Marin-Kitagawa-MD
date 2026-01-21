const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial", "Verdana", "Impact", "Tahoma",
    "Georgia", "Trebuchet MS", "Courier New", "Comic Sans MS"
]

module.exports = {
    name: "wall",
    alias: ["thewall","wallstyle"],
    desc: "Make Wall Style Text Logo",
    react: "🍁",
    category: "Logo Maker",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}wall Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM WALL / BRICK / STONE BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const query = "wall,brick,stone"
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & COLOR ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            const textSize = Math.floor(Math.random() * 20) + 90 // 90-110px
            ctx.font = `bold ${textSize}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const colors = ["#FFFFFF", "#FFD700", "#C0C0C0", "#FF9900", "#FF3300"]
            const textColor = colors[Math.floor(Math.random() * colors.length)]

            const x = width / 2
            const y = height / 2

            // --- 3D Shadow Effect ---
            ctx.fillStyle = "#00000080"
            for (let i = 8; i > 0; i--) {
                ctx.fillText(text, x + i, y + i)
            }

            // --- Glow Layers ---
            const shadowLevels = [20, 40, 70]
            shadowLevels.forEach(level => {
                ctx.shadowColor = textColor
                ctx.shadowBlur = level
                ctx.fillStyle = textColor
                ctx.fillText(text, x, y)
            })

            // --- Front Text ---
            ctx.shadowBlur = 0
            ctx.fillStyle = "#FFFFFF"
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
            m.reply("Error while generating Wall logo.")
        }
    }
}
