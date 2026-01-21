const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { shop, player, axe } = require("../../Database/rpgschema.js");
const eco = require('discord-mongoose-economy');
const ty = eco.connect('mongodb+srv://Sten-X001:1DER1539A@cluster0.unhfsmj.mongodb.net/?retryWrites=true&w=majority');
const fs = require("fs");

module.exports = {
    name: "minecraft",
    desc: "Hunt, mine, dig or chop for resources in a cute RPG style!",
    alias: ["minecra"],
    category: "RPG",
    usage: "hunt/mine/dig/chop [axe]",
    react: "🔨",

    start: async (Miku, message, { text, prefix, args }) => {

        const user = await player.findOne({ id: message.sender });
        if (!user) {
            return Miku.sendMessage(
                message.from,
                { 
                    text: `😿 *Oh no, Senpai!*  
You don’t have an inventory yet!  
Use **${prefix}reg-inv** to create your adventure profile~ 🌟` 
                },
                { quoted: message }
            );
        }

        const axeUsed = (args[0] || "").toLowerCase();
        if (!axeUsed) {
            return Miku.sendMessage(
                message.from,
                { 
                    text: `🤔 *Which tool do you want to use, Senpai?*  
Please specify your axe!

Available options:  
🔨 woodenaxe  
🪓 woodpickaxe  
🪨 stonepickaxe  
⛓️ ironpickaxe  
💎 diamondpickaxe  
🔥 netheritepickaxe` 
                },
                { quoted: message }
            );
        }

        if (!user.inventory[axeUsed] || user.inventory[axeUsed] < 1) {
            return Miku.sendMessage(
                message.from,
                { 
                    text: `😿 *Ehh?! You don't have a ${axeUsed}, Senpai!*  
Use **${prefix}buy** to purchase one and go on a cute mining adventure! 💕` 
                },
                { quoted: message }
            );
        }

        let loot;

        // 💖 Cute & clean loot tables
        const toolStats = {
            woodenaxe: {
                inv: "woodenaxe",
                cost: 1,
                loot: {
                    wood: [8, 12],
                    stone: [2, 4],
                    iron: [1, 2],
                    diamonds: [0, 1]
                }
            },

            woodpickaxe: {
                inv: "woodpickaxe",
                cost: 1,
                loot: {
                    wood: [5, 10],
                    stone: [3, 6],
                    iron: [1, 2],
                    diamonds: [0, 1]
                }
            },

            stonepickaxe: {
                inv: "stonepickaxe",
                cost: 1,
                loot: {
                    wood: [2, 4],
                    stone: [4, 7],
                    iron: [2, 3],
                    diamonds: [1, 2]
                }
            },

            ironpickaxe: {
                inv: "ironpickaxe",
                cost: 1,
                loot: {
                    wood: [1, 2],
                    stone: [4, 7],
                    iron: [4, 5],
                    diamonds: [2, 3]
                }
            },

            diamondpickaxe: {
                inv: "diamondpickaxe",
                cost: 1,
                loot: {
                    wood: [0, 1],
                    stone: [5, 8],
                    iron: [4, 7],
                    diamonds: [40, 70]
                },
                goldenAppleChance: 0.05
            },

            netheritepickaxe: {
                inv: "netheritepickaxe",
                cost: 1,
                loot: {
                    wood: [0, 1],
                    stone: [8, 12],
                    iron: [6, 10],
                    diamonds: [100, 200]
                },
                netheriteScrapChance: 0.10
            }
        };

        const tool = toolStats[axeUsed];

        if (!tool) {
            return Miku.sendMessage(
                message.from,
                { 
                    text: `❌ *Invalid axe, Senpai!*  
Please choose from:  
woodenaxe, woodpickaxe, stonepickaxe, ironpickaxe, diamondpickaxe, netheritepickaxe` 
                },
                { quoted: message }
            );
        }

        // Reduce axe usage
        user.inventory[tool.inv] -= tool.cost;

        // Generate random loot
        loot = {};
        for (let item in tool.loot) {
            let [min, max] = tool.loot[item];
            loot[item] = rand(min, max);
        }

        // Rare items 🎁  
        if (tool.goldenAppleChance && Math.random() <= tool.goldenAppleChance) {
            loot.goldenApple = 1;
        }

        if (tool.netheriteScrapChance && Math.random() <= tool.netheriteScrapChance) {
            loot.netheriteScrap = 1;
        }

        // Add loot to inventory
        for (let item in loot) {
            if (!user.inventory[item]) user.inventory[item] = 0;
            user.inventory[item] += loot[item];
        }

        await user.save();

        let resultMsg =
`🌸 *Kawaii Mining Report, Senpai!* 🌸

🔧 **Tool Used:** ${axeUsed}

⛏️ *Your Loot:* ~

🪵 Wood: **${loot.wood}**
🪨 Stone: **${loot.stone}**
⛓️ Iron: **${loot.iron}**
💎 Diamonds: **${loot.diamonds}**`;

        if (loot.goldenApple) {
            resultMsg += `\n🍎 *WOW! You found a Golden Apple!*`;
        }

        if (loot.netheriteScrap) {
            resultMsg += `\n🔥 *OMG!! Netherite Scrap discovered!*`;
        }

        resultMsg += `\n\nKeep mining, Senpai~ I'm cheering for you! 💖`;

        Miku.sendMessage(message.from, { text: resultMsg }, { quoted: message });
    }
};

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
