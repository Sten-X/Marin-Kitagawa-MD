const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ONE_HOUR = 60 * 60 * 1000;
const { mkhistory } = require('../Database/dataschema.js'); 

// 🔐 DECRYPT CONFIG
const CARDS_KEY = 'atlas-secret';

function decryptCards(base64) {
    try {
        const enc = Buffer.from(base64, 'base64').toString('utf8');
        let out = '';
        for (let i = 0; i < enc.length; i++) {
            out += String.fromCharCode(
                enc.charCodeAt(i) ^
                CARDS_KEY.charCodeAt(i % CARDS_KEY.length)
            );
        }
        return out;
    } catch (e) {
        console.error("Decryption failed:", e);
        return "[]"; // Return empty array string on failure
    }
}

const cardsPath = path.join(__dirname, '../cards.json');
const spawnedCachePath = path.join(__dirname, '../database/spawned_cache.json');
let allCards = [];

// --- LOAD CARDS LOGIC (FIXED) ---
try {
    if (fs.existsSync(cardsPath)) {
        // 1. Read file as raw string
        const rawContent = fs.readFileSync(cardsPath, 'utf8').trim();

        // 2. Check if it is already plain JSON (Starts with [ or {)
        if (rawContent.startsWith('[') || rawContent.startsWith('{')) {
            allCards = JSON.parse(rawContent);
        } else {
            // 3. If not plain JSON, assume it is Encrypted -> Decrypt it
            const decryptedString = decryptCards(rawContent);
            allCards = JSON.parse(decryptedString);
        }

    } else {
        console.log(chalk.red('[CardManager] Error: cards.json not found!'));
    }
} catch (err) {
    console.error('[CardManager] Error reading/parsing cards.json:', err.message);
    // Agar parsing fail ho jaye to empty array rakho taaki bot crash na ho
    allCards = [];
}

/**
 * Helper: atomic file write (write to temp + rename) to avoid corruption
 */
function atomicWriteSync(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, filePath);
}

// Auto-clear cache every hour
setInterval(() => {
    try {
        if (fs.existsSync(spawnedCachePath)) {
            atomicWriteSync(spawnedCachePath, JSON.stringify({}, null, 2));
            console.log(chalk.gray('[CardManager] spawned_cache.json auto-cleared'));
        }
    } catch (e) {
        console.error('[CardManager] Auto-clear spawned cache failed:', e);
    }
}, ONE_HOUR);

module.exports = {
    // Saare cards ka data
    getAllCards: () => allCards,

    // ID se card dhundo
    getCardById: (id) => allCards.find(c => String(c.id) === String(id)),

    // Name se card dhundo
    getCardByName: (query) => {
        if(!query) return null;
        return allCards.find(c => c.title.toLowerCase().includes(query.toLowerCase()));
    },

    // --- MAIN LOGIC: Database se check karo kaunse cards bache hain ---
    getAvailableCards: async () => {
        try {
            // DB se wo saari IDs nikalo jo permanently used/claimed hain
            const historyDocs = await mkhistory.find({});
            const usedCardIds = historyDocs.map(doc => String(doc.cardId));

            // Filter: Total Cards me se wo hata do jo used hain
            const available = allCards.filter(card => !usedCardIds.includes(String(card.id)));
            
            return available;
        } catch (e) {
            console.error("Error fetching available cards:", e);
            return [];
        }
    },

    // Random available card (null agar koi bacha hi nahi)
    getRandomAvailableCard: async () => {
        const avail = await module.exports.getAvailableCards();
        if (!avail || avail.length === 0) return null;
        return avail[Math.floor(Math.random() * avail.length)];
    },

    // --- Mark Card as permanently USED (call this when a user CLAIMS the card) ---
    markAsUsed: async (cardId, claimedBy = null) => {
        try {
            if (!cardId) return null;
            const filter = { cardId: String(cardId) };
            const update = {
                $set: {
                    cardId: String(cardId),
                    claimedAt: new Date(),
                }
            };
            if (claimedBy) update.$set.claimedBy = String(claimedBy);

            // upsert: true -> insert if not exists, else update
            const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
            const doc = await mkhistory.findOneAndUpdate(filter, update, opts);
            console.log(chalk.gray(`[CardManager] markAsUsed -> ${cardId} by ${claimedBy || 'SYSTEM'}`));
            return doc;
        } catch (e) {
            console.error("Error marking card as used (markAsUsed):", e);
            return null;
        }
    },

    // --- TEMPORARY spawn-reserve functions ---

    // getSpawned returns object mapping cardId -> { spawnedAt, groupId?, expiresAt? }
    getSpawned: async () => {
        try {
            if (fs.existsSync(spawnedCachePath)) {
                const raw = fs.readFileSync(spawnedCachePath, 'utf8');
                if (!raw) return {};
                return JSON.parse(raw);
            }
            return {};
        } catch (e) {
            console.error("[CardManager] getSpawned parse error, returning empty:", e);
            return {};
        }
    },

    // saveSpawned writes atomically
    saveSpawned: async (data) => {
        try {
            atomicWriteSync(spawnedCachePath, JSON.stringify(data, null, 2));
        } catch (e) { 
            console.error("Failed to save spawned cache:", e);
        }
    },

    // reserve a card for spawning
    reserveSpawn: async (cardId, meta = {}) => {
        try {
            const spawned = await module.exports.getSpawned();
            if (spawned[cardId]) return false; // already reserved
            spawned[cardId] = {
                spawnedAt: new Date().toISOString(),
                meta
            };
            await module.exports.saveSpawned(spawned);
            return true;
        } catch (e) {
            console.error("reserveSpawn error:", e);
            return false;
        }
    },

    // release a temporary spawn reservation
    releaseSpawn: async (cardId) => {
        try {
            const spawned = await module.exports.getSpawned();
            if (!spawned[cardId]) return false;
            delete spawned[cardId];
            await module.exports.saveSpawned(spawned);
            return true;
        } catch (e) {
            console.error("releaseSpawn error:", e);
            return false;
        }
    }
};