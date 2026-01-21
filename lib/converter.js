const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

// Convert folder (auto-create)
const outputDir = path.join(__dirname, './converted');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

async function downloadFile(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function processCardMedia(url) {
    try {
        if (!url) return { type: 'none' };

        console.log(`[Debug] Checking URL: ${url}`);

        // Normal image
        if (!url.includes('.webm')) {
            return { type: 'image', url: url };
        }

        console.log(`[Debug] Animated WebM detected! Converting...`);

        const fileID = `card_${Date.now()}`;

        const inputPath = path.join(outputDir, `${fileID}.webm`);
        const outputPath = path.join(outputDir, `${fileID}.mp4`);

        // Download webm
        await downloadFile(url, inputPath);

        return new Promise((resolve) => {
            const command = `ffmpeg -y -i "${inputPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -an "${outputPath}"`;

            exec(command, (error) => {
                // delete input webm always
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

                if (error) {
                    console.log("FFmpeg failed → sending image instead.");
                    return resolve({ type: 'image', url });
                }

                console.log("Conversion success → MP4 ready.");
                resolve({ type: 'video', path: outputPath });
            });
        });

    } catch (e) {
        console.log("General converter error:", e.message);
        return { type: 'image', url };
    }
}

module.exports = { processCardMedia };