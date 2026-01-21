const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const axios = require("axios");
const Jimp = require("jimp");
const { mkcard } = require("../../Database/dataschema.js");
const CardMgr = require("../../lib/cardManager.js");

// Temp Directory
const outputDir = path.join(__dirname, "../../lib/converted");

// Auto-create folder
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const TMP_DIR = outputDir;
// --- HELPERS ---

function runCmd(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 200, ...opts }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function downloadTo(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const resp = await axios({ url, method: "GET", responseType: "stream", timeout: 30000 });
  resp.data.pipe(writer);
  return new Promise((res, rej) => {
    writer.on("finish", res);
    writer.on("error", rej);
  });
}

function even(n) { return (Math.floor(n) % 2 === 0) ? Math.floor(n) : Math.floor(n) + 1; }

// --- MAIN COMMAND ---

module.exports = {
  name: "collection",
  alias: ["mycards", "deck", "album", "videodeck"],
  desc: "Show your deck as UltraHD animated Deck",
  category: "Cards",
  usage: "collection <page_number>",
  react: "🎴",
  start: async (Miku, m, { args, prefix, pushName }) => {
    
    // 1. SETTINGS
    const cols = 3;
    const rows = 4;
    
    // Size settings
    const slotW = even(560);  
    const slotH = even(760);  
    
    const padding = 40;
    const duration = 6; 
    const fps = 30;     
    
    let canvasW = (slotW * cols) + (padding * (cols + 1));
    let canvasH = (slotH * rows) + (padding * (rows + 1));
    canvasW = even(canvasW);
    canvasH = even(canvasH);

    const jobId = `${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const JOB_DIR = path.join(TMP_DIR, jobId);
    fs.mkdirSync(JOB_DIR, { recursive: true });

    try {
      // 2. FETCH DATA
      const userCardsDB = await mkcard.find({ owner: m.sender });
      if (!userCardsDB || userCardsDB.length === 0) {
        return m.reply("❌ You have no cards yet! Hunt or buy some.");
      }

      let fullCards = userCardsDB.map(uc => {
        const d = CardMgr.getCardById(uc.cardId);
        return d ? { ...d, count: uc.count } : null;
      }).filter(Boolean);

      // Sort
      fullCards.sort((a, b) => b.tier - a.tier || a.title.localeCompare(b.title));

      const pageSize = cols * rows;
      const totalCards = fullCards.length;
      const totalPages = Math.max(1, Math.ceil(totalCards / pageSize));
      let page = Math.max(1, parseInt(args[0]) || 1);
      if (page > totalPages) return m.reply(`❌ Invalid page. You have ${totalPages} pages.`);

      await m.reply("Please Wait We are fetching your deck... Please wait! ✨");

      const startIndex = (page - 1) * pageSize;
      const pageCards = fullCards.slice(startIndex, startIndex + pageSize);

      // ---------------------------------------------------------
      // 3. GENERATE BACKGROUND
      // ---------------------------------------------------------
      let firstImgPath = null;
      if (pageCards[0] && pageCards[0].imageUrl) {
        const ext = pageCards[0].imageUrl.split('?')[0].split('.').pop().toLowerCase();
        const rawFirst = path.join(JOB_DIR, `first_raw.${(ext === 'webm' || ext === 'mp4') ? ext : 'img'}`);
        try { await downloadTo(pageCards[0].imageUrl, rawFirst); } catch (e) {}

        if (fs.existsSync(rawFirst)) {
            if (ext === 'webm' || ext === 'mp4') {
                const frameP = path.join(JOB_DIR, "first_frame.png");
                try {
                    await runCmd(`ffmpeg -y -ss 0.5 -i "${rawFirst}" -frames:v 1 "${frameP}"`);
                    firstImgPath = frameP;
                } catch (e) { firstImgPath = null; }
            } else {
                firstImgPath = rawFirst;
            }
        }
      }

      if (!firstImgPath) {
        const fallback = path.join(JOB_DIR, "fallback_bg.png");
        new Jimp(canvasW, canvasH, "#1a1a1a").write(fallback);
        firstImgPath = fallback;
      }

      const deckBasePath = path.join(JOB_DIR, "deck_base.png");
      try {
        const bg = await Jimp.read(firstImgPath);
        bg.cover(canvasW, canvasH).blur(20).brightness(-0.4);
        await bg.writeAsync(deckBasePath);
      } catch (e) {
        new Jimp(canvasW, canvasH, "#1a1a1a").write(deckBasePath);
      }

      // ---------------------------------------------------------
      // 4. PROCESS SLOTS (PRESERVE TRANSPARENCY)
      // ---------------------------------------------------------
      const slotFiles = [];
      
      for (let i = 0; i < pageCards.length; i++) {
        const card = pageCards[i];
        const url = card.imageUrl;
        const ext = (url.split('?')[0].split('.').pop() || 'img').toLowerCase();
        
        const rawPath = path.join(JOB_DIR, `raw_${i}.${(ext === 'webm' || ext === 'mp4') ? ext : 'img'}`);
        // IMPORTANT: Using .mov to allow transparency
        const slotPath = path.join(JOB_DIR, `slot_${i}.mov`);

        try { await downloadTo(url, rawPath); } catch (err) {
           await runCmd(`ffmpeg -y -f lavfi -i color=c=black@0.0:s=1x1 -frames:v 1 "${rawPath}"`).catch(()=>{});
        }

        // SCALING: Resize to 560x760 exactly.
        const scaleFilter = `scale=${slotW}:${slotH}`;

        // CODEC: qtrle (QuickTime Animation) supports Transparency (Alpha Channel).
        // Pix Fmt: argb/rgba to keep alpha.
        if (fs.existsSync(rawPath) && (ext === 'webm' || ext === 'mp4')) {
          // Video -> MOV (Alpha)
          const cmd = `ffmpeg -y -c:v libvpx-vp9 -i "${rawPath}" -t ${duration} -vf "${scaleFilter}" -r ${fps} -c:v qtrle -pix_fmt argb -an "${slotPath}"`;
          try { await runCmd(cmd); } catch (e) { console.error(`Slot ${i} Vid Error`, e); }
        } else {
          // Image -> MOV (Alpha)
          const cmd = `ffmpeg -y -loop 1 -i "${rawPath}" -t ${duration} -vf "${scaleFilter}" -r ${fps} -c:v qtrle -pix_fmt argb -an "${slotPath}"`;
          try { await runCmd(cmd); } catch (e) { console.error(`Slot ${i} Img Error`, e); }
        }

        if (!fs.existsSync(slotPath)) {
          // Fallback Transparent placeholder
          await runCmd(`ffmpeg -y -f lavfi -i color=c=black@0.0:s=${slotW}x${slotH} -t ${duration} -r ${fps} -c:v qtrle -pix_fmt argb "${slotPath}"`);
        }

        try { fs.existsSync(rawPath) && fs.unlinkSync(rawPath); } catch(_) {}
        slotFiles.push({ path: slotPath, idx: i });
      }

      // ---------------------------------------------------------
      // 5. COMPOSE VIDEO (OVERLAY WITH ALPHA)
      // ---------------------------------------------------------
      const finalVideo = path.join(JOB_DIR, `deck_final_${jobId}.mp4`);
      const inputArgs = [];

      inputArgs.push(`-loop 1 -t ${duration} -i "${deckBasePath}"`);
      slotFiles.forEach(sf => inputArgs.push(`-i "${sf.path}"`));

      const filters = [];
      let last = "[0:v]"; 
      
      for (let i = 0; i < slotFiles.length; i++) {
        const inLabel = `[${i+1}:v]`;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padding + (col * (slotW + padding));
        const y = padding + (row * (slotH + padding));
        const outLabel = (i === slotFiles.length - 1) ? "" : `[tmp${i+1}]`;
        
        // Use 'overlay' which respects the Alpha channel from the .mov inputs
        filters.push(`${last}${inLabel} overlay=${x}:${y}:format=auto ${outLabel}`);
        last = outLabel || "";
      }

      const filterComplex = filters.join("; ");
      const allInputs = inputArgs.join(" ");
      
      // Final Output is MP4 (Standard)
      const ffCmd = `ffmpeg -y ${allInputs} -filter_complex "${filterComplex}" -map "0:v" -c:v libx264 -crf 23 -preset ultrafast -r ${fps} -pix_fmt yuv420p "${finalVideo}"`;

      try {
        await runCmd(ffCmd);
      } catch (e) {
        console.error("Compose Error:", e);
        try { fs.rmSync(JOB_DIR, { recursive: true, force: true }); } catch(_) {}
        return m.reply("⚠️ Failed to compose video.");
      }

      // ---------------------------------------------------------
      // 6. SEND & CLEANUP
      // ---------------------------------------------------------
      const caption = `🎴 *${pushName}'s Collection* 💌\n` +
                      `━━━━━━━━━━━━━━━\n` +
                      `💫 *Total Cards:* ${totalCards}\n` +
                      `📖 *Page:* ${page}/${totalPages}\n\n` +
                      `💡 *Tip:* Use *${prefix} Deckinfo* to see list!`;

      const buttons = [
        { buttonId: `${prefix}collection ${Math.max(1, page-1)}`, buttonText: { displayText: "⬅️ Previous" }, type: 1 },
        { buttonId: `${prefix}collection ${Math.min(totalPages, page+1)}`, buttonText: { displayText: "➡️ Next" }, type: 1 }
      ];

      await Miku.sendMessage(m.from, {
        video: { url: finalVideo },
        caption,
        footer: `*${global.botName} Gallery*`,
        buttons,
        gifPlayback: true
      }, { quoted: m });

      setTimeout(() => {
        try {
            console.log(`[Collection] Cleaning Job: ${jobId}`);
            fs.rmSync(JOB_DIR, { recursive: true, force: true });
        } catch (e) {
            console.error("Cleanup Error:", e.message);
        }
      }, 5000);

    } catch (err) {
      console.error("Critical Error:", err);
      m.reply("⚠️ Critical error generating deck.");
    }
  }
};