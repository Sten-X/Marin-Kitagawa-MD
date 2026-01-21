const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { Sticker } = require("wa-sticker-formatter");
const { tmpdir } = require("os");
const Jimp = require("jimp");

module.exports = {
    name: "trigger",
    alias: ["triggered"],
    desc: "Creates a triggered sticker",
    category: "Image Manipulation",
    usage: "trigger <reply to image>",
    react: "🍁",

    start: async (Miku, m, { quoted, mime }) => {
        let image;

        // Step 1: Get image (either from quoted message or profile picture)
        if (/image/.test(mime)) {
            image = await quoted.download();
        } else if (m.quoted) {
            try {
                image = await Miku.profilePictureUrl(m.quoted.sender, "image");
            } catch {
                return m.reply("Profile picture not found or private.");
            }
        } else {
            return m.reply("Please reply to an image or tag someone.");
        }

        const id = Date.now();
        const basePath = path.join(tmpdir(), `trigger-${id}`);
        const frameDir = `${basePath}-frames`;
        const inputPath = `${basePath}.png`;
        const gifPath = `${basePath}.gif`;

        fs.mkdirSync(frameDir);

        try {
            // Step 2: Save the input image
            const img = await Jimp.read(image);
            img.resize(256, 256).write(inputPath);

            // Step 3: Generate shaking frames
            for (let i = 0; i < 8; i++) {
                const dx = Math.floor(Math.random() * 10) - 5;
                const dy = Math.floor(Math.random() * 10) - 5;

                const frame = img.clone();
                const redOverlay = new Jimp(256, 256, '#FF000055');
                frame.composite(redOverlay, 0, 0);

                if (fs.existsSync('./Assets/Img/triggered.png')) {
                    const triggeredBanner = await Jimp.read('./Assets/Img/triggered.png');
                    triggeredBanner.resize(256, 54);
                    frame.composite(triggeredBanner, dx, 202 + dy);
                }

                frame.write(path.join(frameDir, `frame${i}.png`));
            }

            // Step 4: Use FFmpeg to convert frames to GIF
            await new Promise((resolve, reject) => {
                const ffmpegCmd = `ffmpeg -y -f image2 -framerate 10 -i ${frameDir}/frame%d.png -vf "scale=256:256:flags=lanczos" ${gifPath}`;
                exec(ffmpegCmd, (err, stdout, stderr) => {
                    if (err) {
                        console.error(stderr);
                        return reject("FFmpeg failed.");
                    }
                    resolve();
                });
            });

            // Step 5: Convert GIF to sticker
            const sticker = new Sticker(fs.readFileSync(gifPath), {
                pack: "Triggered",
                author: "Bot",
                type: "full",
                categories: ["💢"],
            });

            await Miku.sendMessage(m.from, { sticker: await sticker.toBuffer() }, { quoted: m });

        } catch (err) {
            console.error(err);
            m.reply("Error creating triggered sticker.");
        } finally {
            // Clean up
            fs.rmSync(inputPath, { force: true });
            fs.rmSync(gifPath, { force: true });
            fs.rmSync(frameDir, { recursive: true, force: true });
        }
    }
};
