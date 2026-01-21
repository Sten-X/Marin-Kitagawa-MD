const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial", "Verdana", "Impact", "Tahoma", 
    "Georgia", "Trebuchet MS", "Courier New", "Comic Sans MS"
]

module.exports = {
    name: "thunder",
    alias: ["thd"],
    desc: "Make Thunder Style Text Logo",
    react: "🍁",
    category: "Logo Maker",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}thunder Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM THUNDER/STORM BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const query = "thunder,storm,lightning"
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & NEON THUNDER COLORS ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            ctx.font = `bold 100px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const thunderColors = ["#ffff00", "#ffffff", "#00ffff", "#ffcc00", "#ff0000"]
            const thunderColor = thunderColors[Math.floor(Math.random() * thunderColors.length)]

            const x = width / 2
            const y = height / 2

            // --- 3D Shadow Effect ---
            ctx.fillStyle = "#00000080"
            for (let i = 8; i > 0; i--) {
                ctx.fillText(text, x + i, y + i)
            }

            // --- Thunder Glow Layers ---
            const shadowLevels = [25, 50, 90]
            shadowLevels.forEach(level => {
                ctx.shadowColor = thunderColor
                ctx.shadowBlur = level
                ctx.fillStyle = thunderColor
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
            m.reply("Error while generating Thunder logo.")
        }
    }
}
