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
    name: "glitch3",
    alias: ["g3"],
    desc: "Make text logo.",
    react: "🍁",
    category: "Logo Maker",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}glitch3 Marin-MD Bot*`)

        try {
            const width = 1300
            const height = 650
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM CYBER / GLITCH BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const queries = ["cyberpunk", "neon", "digital", "glitch", "tech"]
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
            const textSize = Math.floor(Math.random() * 20) + 90 // 90-110px
            ctx.font = `bold ${textSize}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- Multi-layered Glitch Effect ---
            const glitchLayers = [
                { x: -8, y: 0, color: color1 },
                { x: 8, y: 0, color: color2 },
                { x: 0, y: -8, color: color1 },
                { x: 0, y: 8, color: color2 },
                { x: -4, y: -4, color: color1 },
                { x: 4, y: 4, color: color2 }
            ]
            glitchLayers.forEach(layer => {
                ctx.fillStyle = layer.color
                ctx.fillText(text, x + layer.x, y + layer.y)
            })

            // --- Main Neon Glow Text ---
            ctx.shadowColor = "#ffffff"
            ctx.shadowBlur = 70
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
