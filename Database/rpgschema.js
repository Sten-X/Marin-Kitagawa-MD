// Database/rpgschema.js
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String },
    stats: {
      miningLevel: { type: Number, default: 1 },
      miningXP: { type: Number, default: 0 },
      protectionLevel: { type: Number, default: 0 },
      luckLevel: { type: Number, default: 0 },
    },
    inventory: {
      wood: { type: Number, default: 0 },
      stone: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      coal: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      goldOre: { type: Number, default: 0 },
      emerald: { type: Number, default: 0 },
      lapis: { type: Number, default: 0 },
      obsidian: { type: Number, default: 0 },
      diamonds: { type: Number, default: 0 },
      goldenApple: { type: Number, default: 0 },
      woodenaxe: { type: Number, default: 0 },
      stonepickaxe: { type: Number, default: 0 },
      ironpickaxe: { type: Number, default: 0 },
      diamondpickaxe: { type: Number, default: 0 },
      netheritepickaxe: { type: Number, default: 0 },
      torch: { type: Number, default: 0 },
      backpack: { type: Number, default: 0 },
      luckyCharm: { type: Number, default: 0 },
      repairKit: { type: Number, default: 0 },
      shield: { type: Number, default: 0 },
      guardDog: { type: Number, default: 0 },
      trap: { type: Number, default: 0 },
    },
  },
  { versionKey: false }
);

const player = mongoose.model("Player", playerSchema);

module.exports = { player };