// lib/autospawn.js
const fs = require("fs");
const chalk = require("chalk");
const { mk } = require("../Database/dataschema.js");
const CardMgr = require('./cardManager.js');
const { processCardMedia } = require("./converter.js");  // <-- CONNECTED HERE

if (!global.spawnedCards) global.spawnedCards = new Map();
let isSpawnerRunning = false;

// ----- Load Spawn Cache -----
(async () => {
    try {
        const persisted = await CardMgr.getSpawned();
        if (persisted && Object.keys(persisted).length) {
            for (const [g, data] of Object.entries(persisted)) {
                global.spawnedCards.set(g, data);
            }
        }
    } catch (e) {
        console.error("Failed to load persisted spawned cards:", e);
    }
})();

async function startAutoSpawn(Miku) {
    if (isSpawnerRunning) {
        return;
    }

    isSpawnerRunning = true;

    setInterval(async () => {
        try {
            const availableCards = await CardMgr.getAvailableCards();
            if (!availableCards || availableCards.length === 0) {
                console.log(chalk.red("[AutoSpawn] GAME OVER! All cards have been spawned globally."));
                return;
            }

            const enabledGroups = await mk.find({ cardSystem: "true" });
            if (!enabledGroups || enabledGroups.length === 0) return;

            for (const group of enabledGroups) {
                const groupJid = group.id;

                if (global.spawnedCards.has(groupJid)) continue;

                const randomIndex = Math.floor(Math.random() * availableCards.length);
                const newCard = availableCards[randomIndex];
                if (!newCard) continue;

                const claimCode = newCard.claim ? String(newCard.claim).trim() : null;
                const reserved = await CardMgr.reserveSpawn(String(newCard.id), {
                    group: groupJid,
                    reservedAt: new Date().toISOString(),
                    claimCode
                });

                if (!reserved) {
                    availableCards.splice(randomIndex, 1);
                    if (availableCards.length === 0) break;
                    continue;
                }

                availableCards.splice(randomIndex, 1);

                global.spawnedCards.set(groupJid, {
                    card: newCard,
                    timestamp: Date.now(),
                    claimCode
                });

                try {
                    await CardMgr.saveSpawned(Object.fromEntries(global.spawnedCards.entries()));
                } catch (e) {
                    console.error("Failed to persist spawned map:", e);
                }

                // ----------- BUILD CAPTION -----------
                const stars = "⭐".repeat(newCard.tier || 1);
                const creator = newCard.creators ? newCard.creators.join(", ") : "Unknown";
                const attributes =
                    newCard.specialAttributes?.length > 0
                        ? newCard.specialAttributes.join(", ")
                        : "None";
                const price = newCard.price ? `¥${Number(newCard.price).toLocaleString()}` : "???";
                const prefix = global.prefa || ".";

                const displayClaim = claimCode || "<no-code>";

                const spawnCaption = `*A Wild Card Has Appeared!*

🆔 *Card ID:* *${newCard.id}*

🎗️ *Card:* *${newCard.title}*

⚜️ *Series:* ${newCard.series || "Unknown"}

🧧 *Tier:* ${stars} (${newCard.tier || 1})

〽️ *Creator:* ${creator}

💰 *Value:* ${price}

🪄 *Wants:* ${newCard.wantCount || 0} users

🍁 *Claim Code:* ${displayClaim}
 
⚠️ *This card will NEVER spawn again once CLAIMED!*`;

                // ----------- MEDIA PROCESSING (Converter.js) -----------
                let processedMedia = await processCardMedia(newCard.imageUrl);

                let messagePayload = {};

                try {
                    if (processedMedia.type === "video") {
                        messagePayload = {
                            video: { url: processedMedia.path },
                            caption: spawnCaption
                        };

                        await Miku.sendMessage(groupJid, messagePayload);

                        // Auto delete MP4
                        if (fs.existsSync(processedMedia.path)) {
                            fs.unlinkSync(processedMedia.path);
                            console.log("Auto-deleted converted MP4:", processedMedia.path);
                        }

                    } else {
                        messagePayload = {
                            image: { url: newCard.imageUrl },
                            caption: spawnCaption
                        };

                        await Miku.sendMessage(groupJid, messagePayload);
                    }

                } catch (sendErr) {
                    console.error("[AutoSpawn] Failed to send spawn message:", sendErr);

                    // Release reservation
                    await CardMgr.releaseSpawn(String(newCard.id));

                    // Remove from memory
                    global.spawnedCards.delete(groupJid);

                    // Save cache
                    await CardMgr.saveSpawned(Object.fromEntries(global.spawnedCards.entries()));

                    continue; // move to next group safely
                }

                console.log(
                    chalk.green(
                        `[AutoSpawn] Card spawned in ${groupJid}: ${newCard.title} (code: ${displayClaim})`
                    )
                );

                // ----------- TIMEOUT ----------------
                setTimeout(async () => {
                    try {
                        const currentSpawn = global.spawnedCards.get(groupJid);
                        if (currentSpawn && String(currentSpawn.card.id) === String(newCard.id)) {
                            global.spawnedCards.delete(groupJid);

                            await CardMgr.saveSpawned(Object.fromEntries(global.spawnedCards.entries()));
                            await CardMgr.releaseSpawn(String(newCard.id));

                            await Miku.sendMessage(groupJid, {
                                text: `💨 *${newCard.title}* No One Claimed The Card So It Disappeared!`
                            });
                        }
                    } catch (e) {
                        console.error("Timeout Handler Error:", e);
                    }
                }, 60000);

                if (availableCards.length === 0) break;
            }
        } catch (err) {
            console.error("Error in Auto-Spawn loop:", err);
        }
    }, 60000);
}

module.exports = { startAutoSpawn };