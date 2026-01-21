// Commands/RPG/mine.js
const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { player } = require("../../Database/rpgschema.js");

module.exports = {
  name: "mine",
  alias: ["mine"],
  desc: "Perform mining with selected tool.",
  category: "RPG",
  usage: "hunt2 <tool>",
  react: "⛏",
  start: async (Miku, m, { prefix, args }) => {
    const tool = (args[0] || "").toLowerCase();

    if (!tool) {
      return Miku.sendMessage(
        m.from,
        { text: `😕 Please select a tool.\nUse \`${prefix}mine\` first.` },
        { quoted: m }
      );
    }

    let user = await player.findOne({ id: m.sender });
    if (!user) {
      return Miku.sendMessage(
        m.from,
        {
          text: `😕 You don't have an inventory.\nUse \`${prefix}reg-inv\` first.`,
        },
        { quoted: m }
      );
    }

    const inv = user.inventory;
    const stats = user.stats || { miningLevel: 1, miningXP: 0, luckLevel: 0 };

    // check if user owns that tool
    if (!inv[tool] || inv[tool] <= 0) {
      return Miku.sendMessage(
        m.from,
        {
          text: `😕 You don't own a *${tool}*.\nBuy from shop using \`${prefix}shop\` or craft it using \`${prefix}craft\`.`,
        },
        { quoted: m }
      );
    }

    // Loot multipliers per tool
    const toolConfig = {
      woodenaxe: { mult: 1, lootType: "wood" },
      stonepickaxe: { mult: 1.2, lootType: "basic" },
      ironpickaxe: { mult: 1.6, lootType: "mid" },
      diamondpickaxe: { mult: 2.2, lootType: "high" },
      netheritepickaxe: { mult: 3, lootType: "ultra" },
    };

    if (!toolConfig[tool]) {
      return Miku.sendMessage(
        m.from,
        {
          text: `😕 Invalid tool.\nUse \`${prefix}mine\` to select from list.`,
        },
        { quoted: m }
      );
    }

    const cfg = toolConfig[tool];

    // Mining level effect
    const levelBonus = 1 + (stats.miningLevel - 1) * 0.1;
    const luckBonus = 1 + (stats.luckLevel || 0) * 0.05;

    const rand = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    // base yields
    let gained = {
      wood: 0,
      stone: 0,
      coal: 0,
      iron: 0,
      copper: 0,
      goldOre: 0,
      lapis: 0,
      emerald: 0,
      obsidian: 0,
      diamonds: 0,
      goldenApple: 0,
    };

    // Different loot tables by tier
    switch (cfg.lootType) {
      case "wood":
        gained.wood += rand(5, 15) * cfg.mult * levelBonus;
        gained.stone += rand(0, 4) * levelBonus;
        break;

      case "basic":
        gained.stone += rand(5, 15) * cfg.mult * levelBonus;
        gained.coal += rand(2, 8) * cfg.mult * levelBonus;
        gained.iron += rand(1, 4) * levelBonus;
        break;

      case "mid":
        gained.stone += rand(5, 12) * cfg.mult * levelBonus;
        gained.coal += rand(3, 10) * cfg.mult * levelBonus;
        gained.iron += rand(3, 8) * cfg.mult * levelBonus;
        gained.copper += rand(2, 7) * cfg.mult * levelBonus;
        gained.goldOre += rand(1, 4) * levelBonus;
        gained.lapis += rand(0, 3) * levelBonus;
        break;

      case "high":
        gained.stone += rand(4, 10) * cfg.mult * levelBonus;
        gained.iron += rand(4, 10) * cfg.mult * levelBonus;
        gained.goldOre += rand(2, 6) * cfg.mult * levelBonus;
        gained.lapis += rand(1, 5) * cfg.mult * levelBonus;
        gained.diamonds += rand(1, 5) * levelBonus;
        gained.obsidian += rand(0, 3) * levelBonus;
        gained.emerald += rand(0, 2) * levelBonus;
        break;

      case "ultra":
        gained.iron += rand(5, 12) * cfg.mult * levelBonus;
        gained.goldOre += rand(4, 10) * cfg.mult * levelBonus;
        gained.lapis += rand(2, 6) * cfg.mult * levelBonus;
        gained.diamonds += rand(4, 10) * cfg.mult * levelBonus;
        gained.obsidian += rand(2, 6) * cfg.mult * levelBonus;
        gained.emerald += rand(1, 4) * cfg.mult * levelBonus;
        break;
    }

    // Lucky charm → small chance of golden apple
    let rareRollBase = 0.01; // 1%
    if (inv.luckyCharm && inv.luckyCharm > 0) rareRollBase += 0.03; // +3%
    if (tool === "diamondpickaxe" || tool === "netheritepickaxe")
      rareRollBase += 0.02; // +2%

    if (Math.random() < rareRollBase * luckBonus) {
      gained.goldenApple += 1;
    }

    // add to inventory
    Object.keys(gained).forEach((k) => {
      inv[k] = (inv[k] || 0) + Math.floor(gained[k]);
    });

    // XP gain
    const totalOre =
      gained.stone +
      gained.coal +
      gained.iron +
      gained.copper +
      gained.goldOre +
      gained.lapis +
      gained.diamonds +
      gained.obsidian +
      gained.emerald;

    const xpGained = Math.floor(totalOre / 2) + (gained.goldenApple ? 50 : 0);
    stats.miningXP = (stats.miningXP || 0) + xpGained;

    // Level up logic
    let leveledUp = false;
    const currentLevel = stats.miningLevel || 1;
    const requiredXP = currentLevel * 100;

    if (stats.miningXP >= requiredXP) {
      stats.miningLevel = currentLevel + 1;
      stats.miningXP -= requiredXP;
      leveledUp = true;
    }

    user.stats = stats;
    user.inventory = inv;
    await user.save();

    // Build result message
    let result = `⛏ *Mining Result* – using \`${tool}\`\n\nYou went mining and found:\n`;

    const lines = [];
    for (const [k, v] of Object.entries(gained)) {
      if (!v) continue;
      const emojiMap = {
        wood: "🌲",
        stone: "🪨",
        coal: "🕯",
        iron: "⛓",
        copper: "🟠",
        goldOre: "🟡",
        lapis: "💙",
        emerald: "💚",
        obsidian: "🟪",
        diamonds: "💎",
        goldenApple: "🍎",
      };
      const names = {
        wood: "Wood",
        stone: "Stone",
        coal: "Coal",
        iron: "Iron",
        copper: "Copper",
        goldOre: "Gold Ore",
        lapis: "Lapis",
        emerald: "Emerald",
        obsidian: "Obsidian",
        diamonds: "Diamonds",
        goldenApple: "Golden Apple",
      };
      lines.push(
        `• ${emojiMap[k] || ""} ${names[k]}: +${Math.floor(v)}`
      );
    }

    if (!lines.length) {
      lines.push("• (nothing special… better luck next time 💔)");
    }

    result += lines.join("\n");
    result += `\n\n✨ *XP gained*: ${xpGained}`;
    result += `\n⛏ *Mining Lv.*: ${stats.miningLevel} (XP: ${stats.miningXP})`;

    if (leveledUp) {
      result += `\n\n🎉 *LEVEL UP!* Your Mining Level increased to *${stats.miningLevel}* 🎉`;
    }

    result += `\n\n💡 TIP: Use \`${prefix}craft\` to turn these ores into better tools & protection.`;

    return Miku.sendMessage(m.from, { text: result }, { quoted: m });
  },
};