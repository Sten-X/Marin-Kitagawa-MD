const axios = require("axios");

module.exports = {
  name: "iguser",
  alias: ["instagramuser", "instauser", "iginfo"],
  desc: "To get details of an Instagram user",
  category: "Essentials",
  usage: "iguser <instagram username>",
  react: "🍁",
  start: async (Miku, m, { text, pushName }) => {
    if (!text)
      return m.reply(`Please provide me an Instagram username, ${pushName} senpai!`);

    const username = text.trim();

    try {
      const response = await axios.get(
        `https://api.instavision.io/v1/instagram/profile?username=${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: "sk_02a7744fbfd05ba54924fa7231bddc52", // <-- Yahan apna API key daalein
          },
        }
      );

      const data = response.data;

      if (!data || !data.username) {
        return m.reply(`User "${username}" not found, ${pushName} senpai!`);
      }

      const reply = `
*⚡ Name:* ${data.full_name || "N/A"}
*🔗 Username:* ${data.username || "N/A"}
*🧒 Followers:* ${data.followers || "N/A"}
*✨ Private:* ${data.is_private ? "Yes" : "No"}
*✔ Verified:* ${data.is_verified ? "Yes" : "No"}
*🙋 Following:* ${data.following || "N/A"}
*👤 Posts:* ${data.posts || "N/A"}
*🍭 Bio:* ${data.biography || "N/A"}
`;

      await Miku.sendMessage(
        m.from,
        { image: { url: data.profile_pic_url || data.profile_pic_url_hd }, caption: reply },
        { quoted: m }
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
      return m.reply(`An error occurred! Please check the Instagram username, ${pushName} senpai!`);
    }
  },
};
