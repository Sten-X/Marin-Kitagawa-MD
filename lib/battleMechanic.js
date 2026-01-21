const getCardStats = (card) => {
    const tier = card.tier || 1;
    const hp = (tier * 200) + Math.floor(Math.random() * 50);
    const atk = (tier * 50) + Math.floor(Math.random() * 20);
    const def = (tier * 20) + Math.floor(Math.random() * 10);
    const speed = (tier * 10) + Math.floor(Math.random() * 5);

    return { hp, atk, def, speed, maxHp: hp };
};

module.exports = { getCardStats };