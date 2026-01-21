const { reg } = require("../../Database/dataschema.js");

module.exports = {
  name: "editprofile",
  alias: ["edit", "updateprofile"],
  desc: "Edit your registration details",
  category: "Core",
  react: "📝",

  start: async (Miku, m, { text, args, prefix }) => {

    if (!args[0]) {
      return Miku.sendMessage(
        m.from,
        {
          text: `Edit Profile Panel* \n\nUse format below nya~ \n\n✏ Change Name:\n*${prefix}*editprofile name *Your Name*\n\n✨ Change Age:\n*${prefix}*editprofile age *Your Age*\n\n🏮 Change Gender:\n*${prefix}*editprofile gender *Your Gender*\n\n🔮 Change Region:\n*${prefix}editprofile region *Your Region*\n\nWith love,\n*${botName}*`,
        },
        { quoted: m }
      );
    }

    const field = args[0].toLowerCase();
    const newValue = args.slice(1).join(" ");

    if (!newValue) {
      return m.reply(" Please provide a new value to update!");
    }

    const allowedFields = ["name", "age", "gender", "region"];
    if (!allowedFields.includes(field)) {
      return m.reply(`❌ Invalid field!\nValid fields: *name, age, gender, region*`);
    }

    // Get old profile before update
    const userProfile = await reg.findOne({ id: m.sender });

    if (!userProfile) {
      return m.reply("⚠ You are not registered yet! Use *!register* first.");
    }

    const oldValue = userProfile[field];

    // Prepare update data
    let updateData = {};
    updateData[field] = field === "age" ? parseInt(newValue) : newValue;

    // Update DB
    await reg.updateOne({ id: m.sender }, updateData);

    return Miku.sendMessage(
      m.from,
      {
        text: `✨ *Profile Updated Successfully Senpai!* ✨\n\n📝 *${field.toUpperCase()} Updated*\n\n Old: *${oldValue}*\n New: *${newValue}*\n\nNyaa~ you're even cooler now!`,
      },
      { quoted: m }
    );
  },
};