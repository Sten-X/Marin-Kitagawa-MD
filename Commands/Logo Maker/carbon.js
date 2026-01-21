const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

// Optional fonts
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
    name: "carbon",
    alias: ["carboneffect", "carbonstyle"],
    desc: "Make text logo",
    category: "Logo Maker",
    react: "🍁",

    start: async (Miku, m, { prefix, text}) => {
        if (!text) return m.reply(`Example: *${prefix}carbon Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM CARBON / METALLIC BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const queries = ["carbon texture", "metal background", "dark metal", "carbon fiber"]
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
            const neonColors = ["#00ffff", "#ff00ff", "#ffffff", "#cccccc", "#999999", "#00ff00"]
            const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)]
            const textSize = Math.floor(Math.random() * 20) + 80 // 80-100px
            ctx.font = `bold ${textSize}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- 3D Shadow Effect ---
            ctx.fillStyle = "#00000080"
            for (let i = 10; i > 0; i--) {
                ctx.fillText(text, x + i, y + i)
            }

            // --- Neon / Metallic Glow Layers ---
            const shadowLevels = [25, 50, 80]
            shadowLevels.forEach(level => {
                ctx.shadowColor = neonColor
                ctx.shadowBlur = level
                ctx.fillStyle = neonColor
                ctx.fillText(text, x, y)
            })

            // --- Front Text ---
            ctx.shadowBlur = 0
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
