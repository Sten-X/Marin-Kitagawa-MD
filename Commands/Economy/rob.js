// Commands/Economy/rob.js
const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { player } = require("../../Database/rpgschema.js");
const eco = require("discord-mongoose-economy");
const ty = eco.connect("mongodb+srv://Sten-X001:1DER1539A@cluster0.unhfsmj.mongodb.net/?retryWrites=true&w=majority");

const cooldownTime = 1000 * 60 * 3; // 3 minutes cooldown
const cooldown = new Map();

module.exports = {
  name: "rob",
  alias: ["rob"],
  desc: "Rob another user with RPG protection system",
  category: "RPG",
  usage: "rob @user",
  react: "💣",

  start: async (Miku, m, { prefix, args }) => {
    const cara = "cara";

    if (cooldown.has(m.sender)) {
      let remaining = cooldown.get(m.sender) - Date.now();
      if (remaining > 0) {
        let sec = Math.ceil(remaining / 1000);
        return Miku.sendMessage(
          m.from,
          { text: `⏳ Please wait *${sec} seconds* before robbing again!` },
          { quoted: m }
        );
      }
    }

    let target;

    // @mention
    if (m.mentionedJid && m.mentionedJid[0]) {
      target = m.mentionedJid[0];
    }

    // reply to message
    else if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    }

    // number input
    else if (args[0]) {
      let num = args[0].replace(/[^0-9]/g, "");
      if (num.length > 5) target = num + "@s.whatsapp.net";
    }

    if (!target) {
      return Miku.sendMessage(
        m.from,
        {
          text: `😕 Please tag someone to rob.\n\nExamples:\n• ${prefix}rob @user\n• ${prefix}rob (reply)\n• ${prefix}rob 9183xxxxxx`
        },
        { quoted: m }
      );
    }

    if (target === m.sender) {
      return Miku.sendMessage(
        m.from,
        { text: `💀 You can't rob yourself, baka~` },
        { quoted: m }
      );
    }
    const robberID = m.sender;
    const victimID = target;

    const [robberBal, victimBal] = await Promise.all([
      eco.balance(robberID, cara),
      eco.balance(victimID, cara),
    ]);

    if (victimBal.wallet < 300) {
      return Miku.sendMessage(
        m.from,
        { text: `😕 Target has too little Gold in wallet to rob.` },
        { quoted: m }
      );
    }

    let robber = await player.findOne({ id: robberID });
    let victim = await player.findOne({ id: victimID });

    if (!robber) robber = await player.create({ id: robberID });
    if (!victim) victim = await player.create({ id: victimID });

    const rStats = robber.stats || {};
    const vStats = victim.stats || {};

    const rInv = robber.inventory;
    const vInv = victim.inventory;

    let successChance = 0.45; // base 45%

    // Robber buffs
    successChance += (rStats.luckLevel || 0) * 0.05;
    if (rInv.luckyCharm > 0) successChance += 0.10;

    // Victim protection
    successChance -= (vStats.protectionLevel || 0) * 0.04;
    successChance -= (vInv.shield || 0) * 0.05;
    successChance -= (vInv.guardDog || 0) * 0.07;

    // Limit between 10% and 85%
    successChance = Math.max(0.1, Math.min(successChance, 0.85));

    const roll = Math.random();
    const maxSteal = Math.floor(victimBal.wallet * 0.25); // steal up to 25%
    const amount = Math.max(100, Math.floor(Math.random() * maxSteal));

    if (roll < successChance) {
      await eco.deduct(victimID, cara, amount);
      await eco.give(robberID, cara, amount);

      cooldown.set(m.sender, Date.now() + cooldownTime);

      return Miku.sendMessage(
        m.from,
        {
          text: `💣 *Robbery Successful!*  
You stole *${amount} Gold* from @${victimID.split("@")[0]} 😼`,
          mentions: [victimID]
        },
        { quoted: m }
      );
    }

    let fine = Math.floor(amount * 0.5);
    let extra = "";

    // Guard dog penalty
    if (vInv.guardDog > 0) {
      fine += 400;
      extra += "\n🐶 Victim’s *Guard Dog* attacked you!";
    }

    // Trap reversed robbery
    if (vInv.trap > 0) {
      vInv.trap -= 1;
      await victim.save();

      await eco.deduct(robberID, cara, fine);
      await eco.give(victimID, cara, fine);

      cooldown.set(m.sender, Date.now() + cooldownTime);

      return Miku.sendMessage(
        m.from,
        {
          text: `🪤 *TRAP ACTIVATED!*  
You tried to rob @${victimID.split("@")[0]}, but stepped on a TRAP!  
You paid *${fine} Gold* to them!${extra}`,
          mentions: [victimID]
        },
        { quoted: m }
      );
    }

    // Normal failure fine
    await eco.deduct(robberID, cara, fine);
    await eco.give(victimID, cara, Math.floor(fine / 2));

    cooldown.set(m.sender, Date.now() + cooldownTime);

    return Miku.sendMessage(
      m.from,
      {
        text: `💣 *Robbery Failed!*  
You were caught trying to rob @${victimID.split("@")[0]}  
You paid *${fine} Gold* as punishment.${extra}`,
        mentions: [victimID]
      },
      { quoted: m }
    );
  },
};