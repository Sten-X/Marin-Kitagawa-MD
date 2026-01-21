const { createCanvas, loadImage } = require('canvas');
const { fetchBuffer } = require("../../lib/Function");

module.exports = {
    name: "rank",
    alias: ["rank"],
    desc: "shows the rank",
    cool: 3,
    react: "✅",
    category: "RPG",
    start: async (Miku, m, { pushName }) => {
        // Fetch user data from your Levels system
        const userq = await Levels.fetch(m.sender, "bot");
        const levelRole = userq.level;

        // Determine role based on level
        let role = 'Citizen';
        if (levelRole <= 2) role = 'Beginner';
        else if (levelRole <= 4) role = 'Fiend';
        else if (levelRole <= 6) role = 'Hellion';
        else if (levelRole <= 8) role = 'Abomination';
        else if (levelRole <= 10) role = 'Demon';
        else if (levelRole <= 12) role = 'Archdemon';
        else if (levelRole <= 14) role = 'Infernal Lord';
        else if (levelRole <= 16) role = 'Demon King';
        else if (levelRole <= 18) role = 'Demon Emperor';
        else if (levelRole <= 20) role = 'Dark Lord';
        else if (levelRole <= 22) role = 'Shadow Emperor';
        else if (levelRole <= 24) role = 'Hellfire Emperor';
        else if (levelRole <= 26) role = 'Demon Overlord';
        else if (levelRole <= 28) role = 'Devil King';
        else if (levelRole <= 30) role = 'Underworld Emperor';
        else if (levelRole <= 32) role = 'Prince of Darkness';
        else if (levelRole <= 34) role = 'Lord of the Underworld';
        else if (levelRole <= 36) role = 'Demon Lord Supreme';
        else if (levelRole <= 38) role = 'Master of the Inferno';
        else if (levelRole <= 40) role = 'Emperor of the Dark Realms';
        else if (levelRole <= 42) role = 'Lord of the Flames';
        else if (levelRole <= 44) role = 'Shadow Lord';
        else if (levelRole <= 46) role = 'Devil Emperor';
        else if (levelRole <= 48) role = 'Demon General';
        else if (levelRole <= 50) role = 'Devil King Supreme';
        else if (levelRole <= 52) role = 'Inferno Lord';
        else if (levelRole <= 54) role = 'Demon Warlord';
        else if (levelRole <= 56) role = 'Supereme';
        else if (levelRole <= 58) role = 'Emperor';
        else if (levelRole <= 60) role = 'Yaksa';
        else if (levelRole <= 62) role = 'Ancient Vampire';
        else if (levelRole <= 64) role = 'Hellfire King';
        else if (levelRole <= 66) role = 'Supreme Demon Lord';
        else if (levelRole <= 68) role = 'Revered Ruler';
        else if (levelRole <= 70) role = 'Divine Ruler';
        else if (levelRole <= 72) role = 'Eternal Ruler';
        else if (levelRole <= 74) role = 'Prime';
        else if (levelRole <= 76) role = 'Prime Lord';
        else if (levelRole <= 78) role = 'The Prime Emperor';
        else if (levelRole <= 80) role = 'The Original';
        else if (levelRole <= 100) role = 'High Level Bitch';

        // Extract discriminator - last 4 digits after '91' or whatever your sender format is
        let disc = m.sender.substring(3, 7);

        // Prepare text for caption
        let textr = "";
        if (pushName) {
            textr += `*${pushName}#${disc}'s* Exp\n\n`;
        } else {
            textr += `*${m.sender}#${disc}'s* Exp\n\n`;
        }
        textr += `*🎯️XP*: ${userq.xp} / ${Levels.xpFor(userq.level + 1)}\n*❤️Level*: ${userq.level}\n*🔮️Role*: ${role}`;

        // Load profile picture or fallback
        let ppuser;
        try {
            let url = await Miku.profilePictureUrl(m.sender, 'image');
            ppuser = await loadImage(url);
        } catch {
            const fallback = 'https://www.linkpicture.com/q/IMG-20220118-WA0387.png';
            const buffer = await fetchBuffer(fallback);
            ppuser = await loadImage(buffer);
        }

        // Calculate average color of avatar to set background color dynamically
        const avgColor = getAverageColor(ppuser);

        // Setup canvas dimensions (bigger as requested)
        const width = 900;
        const height = 300;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background gradient with average color and darkened version
        const darkColor = darkenColor(avgColor, 0.6);
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `rgb(${avgColor.r},${avgColor.g},${avgColor.b})`);
        gradient.addColorStop(1, `rgb(${darkColor.r},${darkColor.g},${darkColor.b})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw avatar with white border and shadow
        const avatarX = 150;
        const avatarY = height / 2;
        const avatarRadius = 120;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 8, 0, Math.PI * 2, true);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // Clip avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(ppuser, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();

        // Username and discriminator
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Sans-serif';
        ctx.fillText(pushName || m.sender.split('@')[0], 300, 110);

        ctx.font = '28px Sans-serif';
        ctx.fillStyle = '#ddd';
        ctx.fillText(`#${disc}`, 300, 150);

        // Level and role info
        ctx.fillStyle = '#fff';
        ctx.font = '30px Sans-serif';
        ctx.fillText(`Level: ${userq.level}`, 300, 200);
        ctx.fillText(`Role: ${role}`, 300, 240);

        // XP progress bar background
        const barX = 300;
        const barY = 260;
        const barWidth = 550;
        const barHeight = 30;

        ctx.fillStyle = '#444';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Calculate progress ratio
        const requiredXP = Levels.xpFor(userq.level + 1);
        const progress = Math.min(userq.xp / requiredXP, 1);

        // Progress bar fill (lighter version of avg color)
        const lightColor = lightenColor(avgColor, 0.4);
        const fillGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        fillGradient.addColorStop(0, `rgb(${lightColor.r},${lightColor.g},${lightColor.b})`);
        fillGradient.addColorStop(1, `rgb(${avgColor.r},${avgColor.g},${avgColor.b})`);
        ctx.fillStyle = fillGradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border around progress bar
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Draw XP text inside progress bar
        ctx.fillStyle = '#fff';
        ctx.font = '20px Sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${userq.xp} / ${requiredXP} XP`, barX + barWidth / 2, barY + barHeight - 7);
        ctx.textAlign = 'start'; // reset alignment

        // Export image buffer and send
        const buffer = canvas.toBuffer();
        Miku.sendMessage(m.from, { image: buffer, caption: textr }, { quoted: m });
    }
};

// Helper to calculate average color of an image
function getAverageColor(img) {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;
    let count = 0;

    // Sample every 4th pixel to reduce CPU load (optional)
    for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
    };
}

// Helper to darken color by a factor (0 to 1)
function darkenColor(color, factor) {
    return {
        r: Math.max(Math.min(Math.floor(color.r * factor), 255), 0),
        g: Math.max(Math.min(Math.floor(color.g * factor), 255), 0),
        b: Math.max(Math.min(Math.floor(color.b * factor), 255), 0),
    };
}

// Helper to lighten color by a factor (0 to 1)
function lightenColor(color, factor) {
    return {
        r: Math.min(Math.floor(color.r + (255 - color.r) * factor), 255),
        g: Math.min(Math.floor(color.g + (255 - color.g) * factor), 255),
        b: Math.min(Math.floor(color.b + (255 - color.b) * factor), 255),
    };
}
