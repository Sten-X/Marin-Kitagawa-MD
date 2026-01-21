const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial", "Verdana", "Impact", "Tahoma", 
    "Georgia", "Trebuchet MS", "Courier New", "Comic Sans MS"
]

const colors = ["#6b4226", "#a67c52", "#c19a6b", "#8b5e3c", "#d2b48c"]

module.exports = {
    name: "pencil",
    alias: ["pencilstyle","pencileffect"],
    desc: "Make Pencil Style Text Logo",
    category: "Logo Maker",
    react: "🍁",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}pencil Marin-MD Bot*`)

        try {
            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM BACKGROUND (pencil / sketch / paper) ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const query = "pencil,sketch,paper"
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & RANDOM COLOR ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            const color = colors[Math.floor(Math.random() * colors.length)]
            const textSize = Math.floor(Math.random() * 20 + 80) // 80-100px
            ctx.font = `bold ${textSize}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- Pencil sketch shadow effect ---
            ctx.fillStyle = "#00000050"
            for (let i = 8; i > 0; i--) {
                ctx.fillText(text, x + i, y + i)
            }

            // --- Main text ---
            ctx.shadowBlur = 0
            ctx.fillStyle = color
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
            m.reply("Error while generating pencil logo.")
        }
    }
}
