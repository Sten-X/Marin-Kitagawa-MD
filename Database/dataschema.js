const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  antilink: { type: String, default: "false" },
  nsfw: { type: String, default: "false" },
  bangroup: { type: String, default: "false" },
  chatBot: { type: String, default: "false" },
  botSwitch: { type: String, default: "true" },
  switchNSFW: { type: String, default: "false" },
  switchWelcome: { type: String, default: "false" },
  cardSystem: { type: String, default: "false" },
  pokemonSystem: { type: String, default: "false" }
});
const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  ban: { type: String, default: "false" },
  name: { type: String },
  gcname: { type: String },
  reason: { type: String, default: "no reason" },
  addedMods: { type: String, default: "false" },
  afk: { type: String, default: "false" },
  afkReason: { type: String, default: "" }
});
const RegisterSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String },
  age: { type: Number },
  gender: { type: String },
  region: { type: String },
  registered: { type: Boolean, default: false },
  profileImage: { type: String, default: "" },
  step: { type: String, default: "none" }
});
const CharacterSchema = new mongoose.Schema({
  id: { type: String, unique: false, required: true, default: "1" },
  seletedCharacter: { type: String, default: "0" },
  PMchatBot: { type: String, default: "false" },
  privateMode: { type: String, default: "false" }
});
const CardSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    cardId: { type: String, required: true },
    count: { type: Number, default: 1 },
    obtainedAt: { type: Date, default: Date.now }
});
const HistorySchema = new mongoose.Schema({
    cardId: { type: String, unique: true, required: true }, 
    spawnedAt: { type: Date, default: Date.now }
});
const MarketSchema = new mongoose.Schema({
    seller: { type: String, required: true },
    cardId: { type: String, required: true },
    price: { type: Number, required: true },
    listedAt: { type: Date, default: Date.now }
});
const BattleStatsSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    mainCardId: { type: String, default: "" },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    elo: { type: Number, default: 1000 },
    mainPokeId: { type: String, default: "" },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    elo: { type: Number, default: 1000 }
});
const PokemonSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    pokeId: { type: Number, required: true },
    name: { type: String, required: true },
    level: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    shiny: { type: Boolean, default: false },
    nickname: { type: String, default: "" },
    caughtAt: { type: Date, default: Date.now },
    happiness: { type: Number, default: 50 }, 
    protected: { type: Boolean, default: false }, 
    maxHp: { type: Number, default: 100 }, 
    currentHp: { type: Number, default: 100 }, 
    trainedAtk: { type: Number, default: 0 },
    trainedDef: { type: Number, default: 0 }
});
const mku = mongoose.model("Mku", UserSchema);
const mk = mongoose.model("Mk", GroupSchema);
const mkchar = mongoose.model("Mkchar", CharacterSchema);
const mkcard = mongoose.model("Mkcard", CardSchema);
const mkhistory = mongoose.model("MkHistory", HistorySchema);
const mkmarket = mongoose.model("Mkmarket", MarketSchema);
const mkbattle = mongoose.model("Mkbattle", BattleStatsSchema); 
const reg = mongoose.model("Register", RegisterSchema);
const mkpokemon = mongoose.model("Mkpokemon", PokemonSchema);

module.exports = { mk, mku, mkchar, mkcard, mkhistory, mkmarket, mkbattle, reg, mkpokemon };