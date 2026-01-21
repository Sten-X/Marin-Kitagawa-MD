const os = require("os");

module.exports = {
  name: "ping",
  alias: ["p", "pong"],
  desc: "Shows bot status and system info",
  category: "Core",
  usage: "Bot Kawai Heartbeat Check",
  react: "🍁",

  start: async (Miku, m, { prefix, pushName }) => {
    try {
      // safe fallbacks
      const botName = typeof global.botName !== "undefined" ? global.botName : "Magical Waifu";
      const botVideo = typeof global.botVideo !== "undefined" ? global.botVideo : null;

      // 1) Send immediate quick response
      const quickMsg = {
        text: "🐾 Nyaa~ Hold On Cutie~ I'm Checking My Heartbeat... ⏳",
      };
      await Miku.sendMessage(m.from, quickMsg, { quoted: m });

      // small playful delay before full report
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Get uptime info (bot)
      const uptimeSeconds = Math.floor(process.uptime());
      const upDays = Math.floor(uptimeSeconds / 86400);
      const upHours = Math.floor((uptimeSeconds % 86400) / 3600);
      const upMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const upSeconds = uptimeSeconds % 60;
      const uptimeHuman = `${upDays}d ${upHours}h ${upMinutes}m ${upSeconds}s`;
      const shortUptime = `${upHours}h ${upMinutes}m ${upSeconds}s`;

      // System uptime (OS)
      const sysUptimeSeconds = Math.floor(os.uptime());
      const sysDays = Math.floor(sysUptimeSeconds / 86400);
      const sysHours = Math.floor((sysUptimeSeconds % 86400) / 3600);
      const sysMinutes = Math.floor((sysUptimeSeconds % 3600) / 60);
      const sysSeconds = sysUptimeSeconds % 60;
      const systemUptimeHuman = `${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s`;

      // System Info
      const platform = os.platform();
      const cpus = os.cpus() || [];
      const cpuModel = cpus.length ? cpus[0].model : "Unknown CPU";
      const freeMemMB = Math.round(os.freemem() / 1024 / 1024);
      const totalMemMB = Math.round(os.totalmem() / 1024 / 1024);

      // Heartbeat (playful)
      const heartbeatMs = Math.floor(Math.random() * 300) + 68; // ~68 - 367 ms
      const heartbeat = `${heartbeatMs}ms Cutie~!`;

      // Fluffy facts
      const fluffyFacts = [
        "Even CPUs get jealous of my multitasking skills~ 💻",
        "I bloom bytes instead of petals when I'm happy~ ✨",
        "If I had a tail, it would wag every time you pinged me~ 🐾",
        "I count hearts, not cycles — but cycles are cute too~ 💓",
        "I take my coffee in code — extra loops, hold the bugs~ ☕️",
      ];
      const fluffyFact = fluffyFacts[Math.floor(Math.random() * fluffyFacts.length)];

      // Buttons
      const buttons = [
        {
          buttonId: `${prefix}help`,
          buttonText: { displayText: "🕯️ Help" },
          type: 1,
        },
        {
          buttonId: `${prefix}owner`,
          buttonText: { displayText: "🎀 Owner" },
          type: 1,
        },
      ];

      // Construct caption (stylized)
      const caption = `
┊         ┊       ┊   ┊    ┊        ┊
┊         ┊       ┊   ┊   ˚★⋆｡˚  ⋆
┊         ┊       ┊   ⋆
┊         ┊       ★⋆
┊ ◦      ┊
★⋆      ┊ .  ˚
           ˚★
🎀 *${botName} Magical Ping Scan!* 

💕Konnichiwa – こんにちは~ *${pushName}*!

⚡️ *Heartbeat Speed:* \`${heartbeat}\`  
🕒 *Uptime:* ${shortUptime} (I’ve Been Waiting For You~ )  
💤 *System Uptime:* ${systemUptimeHuman}  
💾 *Memory:* ${freeMemMB}MB Free / ${totalMemMB}MB Total  
💻 *Platform:* ${platform}  
🎀 *CPU:* ${cpuModel}

💖 *Fluffy Fact:*  
"${fluffyFact}"

With Sparkles, Love, And A Head Tilt~  
🎀 *${botName}* — Your Magical Waifu Assistant.


`.trim();

      // Message payload for full report
      const pingMessage = {
        caption,
        footer: `✨ _ᴘᴏᴡᴇʀᴇᴅ ʙʏ:_ *© ${botName}*`,
        buttons,
        headerType: botVideo ? 4 : 1,
      };

      if (botVideo) {
        pingMessage.video = botVideo;
        pingMessage.gifPlayback = true;
      }

      await Miku.sendMessage(m.from, pingMessage, { quoted: m });
    } catch (err) {
      console.error("Ping command error:", err);
      await Miku.sendMessage(
        m.from,
        {
          text: `⚠️ Sorry *${pushName || "Cutie"}*, an error occurred while checking my heartbeat.`,
        },
        { quoted: m }
      );
    }
  },
};