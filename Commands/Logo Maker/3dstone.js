const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

// Optional fonts
const fonts = [
    "Arial",
    "Verdana",
    "Comic Sans MS",
    "Impact",
    "Tahoma",
    "Georgia",
    "Trebuchet MS"
]

module.exports = {
    name: "3dstone",
    alias: ["3ds"],
    desc: "Make text logo.",
    category: "Logo Maker",
    react: "🍁",

    start: async (Miku, m, { prefix, text}) => {
        if (!text) return m.reply(`Example: *${prefix}3dstone Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM STONE/ROCK IMAGE ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const queries = ["stone", "rock", "marble", "granite", "boulder"]
            const query = queries[Math.floor(Math.random() * queries.length)]
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`
            
            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & COLOR ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            const stoneColors = ["#A9A9A9", "#808080", "#696969", "#D3D3D3", "#C0C0C0"] // gray/stone shades
            const stoneColor = stoneColors[Math.floor(Math.random() * stoneColors.length)]
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

            // --- Stone Glow Layers (subtle neon-ish for contrast) ---
            const shadowLevels = [15, 30, 50]
            shadowLevels.forEach(level => {
                ctx.shadowColor = stoneColor
                ctx.shadowBlur = level
                ctx.fillStyle = stoneColor
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
