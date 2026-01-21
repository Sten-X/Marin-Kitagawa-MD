const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  name: "spotify",
  alias: ["spot", "song", "play"],
  desc: "Spotify Downloader (Multi-API Backup System)",
  category: "Media",
  usage: "spotify <link>",
  react: "🎧",
  start: async (Miku, m, { text, prefix, args }) => {
    
    if (!args[0]) return m.reply(`⚠️ Link kahan hai?\nExample: *${prefix}spotify Believer*`);

    m.reply("🎵 Searching & Downloading...");

    try {
        // 1. Get Spotify Metadata (Tumhari Vercel API)
        const spotApiUrl = `https://sten-x-nsfw-api.vercel.app/api/spotify?url=${encodeURIComponent(text)}`;
        const { data: spotData } = await axios.get(spotApiUrl);

        if (!spotData.status) return m.reply("❌ Spotify Data nahi mila.");
        const res = spotData.result;

        // === 🛡️ THE FALLBACK DOWNLOADER 🛡️ ===
        const getAudioLink = async (ytUrl) => {
            // API List (Priority Wise)
            const apis = [
                // 1. Tumhari Vercel API (Fastest)
                { url: `https://sten-x-nsfw-api.vercel.app/api/yt?url=${ytUrl}`, type: 'sten' },
                // 2. Yupra API (Backup 1)
                { url: `https://api.yupra.my.id/api/downloader/ytmp3?url=${ytUrl}`, type: 'yupra' },
                // 3. Keith API (Backup 2)
                { url: `https://apis-keith.vercel.app/download/dlmp3?url=${ytUrl}`, type: 'keith' },
                // 4. Gifted API (Backup 3 - Purani wali)
                { url: `https://api.giftedtech.my.id/api/download/dlmp3?url=${ytUrl}&apikey=gifted`, type: 'gifted' }
            ];

            for (let api of apis) {
                try {
                    const { data } = await axios.get(api.url);
                    
                    // Har API ka response structure alag hota hai
                    if (api.type === 'sten' && data.status) return data.result.dl_link;
                    if (api.type === 'yupra' && data.status) return data.download.url;
                    if (api.type === 'keith' && data.status) return data.result.downloadUrl;
                    if (api.type === 'gifted' && data.status !== false) return data.result.dl_link || data.url; // Gifted structure

                } catch (e) {
                    console.log(`API Failed: ${api.type}`);
                    // Continue to next API...
                }
            }
            return null; // Agar sab fail ho gaye
        };

        // === FUNCTION TO PROCESS SONG ===
        const processSong = async (name, artist, cover) => {
            // A. YouTube Search
            const search = await yts(`${name} ${artist} audio`);
            const video = search.videos[0];

            if (!video) return;

            // B. Get Audio Link (Using Multi-API)
            const dlLink = await getAudioLink(video.url);

            if (dlLink) {
                await Miku.sendMessage(m.from, { 
                    audio: { url: dlLink }, 
                    mimetype: "audio/mpeg",
                    fileName: `${name}.mp3`,
                    contextInfo: {
                        externalAdReply: {
                            title: name,
                            body: artist,
                            thumbnailUrl: cover,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
            } else {
                // 👇 YAHAN ERROR THA (m.sendMessage -> Miku.sendMessage)
                await Miku.sendMessage(m.from, { text: `❌ Failed to download: ${name}` }, { quoted: m });
            }
        };

        // === MAIN LOGIC ===
        if (res.type === "track") {
            let caption = `🎧 *${res.name}*\n👤 *Artist:* ${res.artist}\n💿 *Album:* ${res.album}\n🔗 *Link:* ${res.url}`;
            await Miku.sendMessage(m.from, { image: { url: res.cover }, caption: caption }, { quoted: m });
            await processSong(res.name, res.artist, res.cover);
        } 
        else {
            // Playlist Mode
            let txt = `📜 *${res.name}*\n🔢 *Total:* ${res.total_tracks} Songs\n⬇️ *Downloading...*`;
            await Miku.sendMessage(m.from, { image: { url: res.cover }, caption: txt }, { quoted: m });

            const tracks = res.tracks;
            const limit = tracks.length > 20 ? 20 : tracks.length;

            for (let i = 0; i < limit; i++) {
                await processSong(tracks[i].name, tracks[i].artist, res.cover);
                await new Promise(r => setTimeout(r, 4000)); // 4 Sec delay
            }
            m.reply("✅ Playlist Done!");
        }

    } catch (e) {
        console.error("Spotify Error:", e);
        m.reply("❌ Fatal Error.");
    }
  }
};