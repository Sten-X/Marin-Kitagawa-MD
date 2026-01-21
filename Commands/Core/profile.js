const { reg } = require("../../Database/dataschema.js");

module.exports = {
  name: "profile",
  alias: ["acc","user"],
  desc: "Show your user profile",
  category: "Core",
  react: "👤",
  start: async(Miku, m) => {
    let data = await reg.findOne({ id: m.sender });
    if(!data) return m.reply("❌ You are not registered. Type *register* to register");

    Miku.sendMessage(m.from, {
      text: `*👤 User Profile*\n\nName : ${data.name}\nAge : ${data.age}\nGender : ${data.gender}\nRegion : ${data.region}\nStatus : Verified ✔`
    },{quoted:m});
  }
}