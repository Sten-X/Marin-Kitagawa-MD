const { createCanvas, loadImage } = require("canvas")
const axios = require("axios")

const fonts = [
    "Arial",
    "Verdana",
    "Impact",
    "Tahoma",
    "Georgia",
    "Trebuchet MS",
    "Comic Sans MS",
    "Courier New"
]

module.exports = {
    name: "joker",
    alias: ["joker"],
    desc: "Make text logo.",
    react: "🍁",
    category: "Logo Maker",

    start: async (Miku, m, { prefix, text }) => {
        if (!text) return m.reply(`Example: *${prefix}joker Marin-MD Bot*`)

        try {
            const width = 1300
            const height = 650
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext("2d")

            // --- PIXABAY RANDOM BACKGROUND ---
            const pixabayAPI = "54164246-c83b8dee398b874d43650c040"
            const queries = ["joker", "dark", "clown", "villain", "theatre"]
            const query = queries[Math.floor(Math.random() * queries.length)]
            const url = `https://pixabay.com/api/?key=${pixabayAPI}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=50`

            const response = await axios.get(url)
            const hits = response.data.hits
            if (!hits.length) return m.reply("No images found from Pixabay!")

            const randomImage = hits[Math.floor(Math.random() * hits.length)].largeImageURL
            const bg = await loadImage(randomImage)
            ctx.drawImage(bg, 0, 0, width, height)

            // --- RANDOM FONT & JOKER STYLE COLORS ---
            const font = fonts[Math.floor(Math.random() * fonts.length)]
            const jokerColors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff33ff"]
            ctx.font = `bold ${Math.floor(Math.random() * 30 + 100)}px ${font}`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            const x = width / 2
            const y = height / 2

            // --- Joker Layered Shadow Effect ---
            const layers = [
                { x: -10, y: -10, color: jokerColors[Math.floor(Math.random() * jokerColors.length)] },
                { x: 10, y: -10, color: jokerColors[Math.floor(Math.random() * jokerColors.length)] },
                { x: -10, y: 10, color: jokerColors[Math.floor(Math.random() * jokerColors.length)] },
                { x: 10, y: 10, color: jokerColors[Math.floor(Math.random() * jokerColors.length)] }
            ]
            layers.forEach(layer => {
                ctx.fillStyle = layer.color
                ctx.fillText(text, x + layer.x, y + layer.y)
            })

            // --- Front Neon Text ---
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
