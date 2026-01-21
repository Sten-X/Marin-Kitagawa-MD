const mongoose = require("mongoose");
require("../../config.js");
require("../../Core.js");
const { playlist } = require("../../Database/playliist.js");
const yts = require("youtube-yts");

module.exports = {
  name: "playlist",
  desc: "Create and Manage Music Playlists",
  alias: ["pl", "music"],
  category: "Media",
  react: "🎵",

  start: async (Miku, m, { text, prefix, args, pushName }) => {
    const commandRegex = /^(create|add|remove|view|delete)\s+(\S+)(?:\s+(.+))?/i;
    const match = text ? text.match(commandRegex) : null;

    // agar koi action nahi diya → tips + playlists dikhao
    if (!match) {
      try {
        const pls = await playlist.find({ owner: m.sender });

        let msg = `🧣 Konichiwa *${pushName}-chan*! Here’s how you can use playlists 🎶\n\n`;

        msg += `✨ *Playlist Commands Guide:*\n`;
        msg += `> *${prefix}pl create MyPlaylist* → Create new playlist\n`;
        msg += `> *${prefix}pl add MyPlaylist Song Name* → Add a song\n`;
        msg += `> *${prefix}pl view MyPlaylist* → View songs\n`;
        msg += `> *${prefix}pl remove MyPlaylist SongURL* → Remove a song\n`;
        msg += `> *${prefix}pl delete MyPlaylist* → Delete entire playlist 🗑️\n\n`;

        if (pls.length === 0) {
          msg += `❌ You don’t have any playlists yet nya~\nCreate one now with:\n*${prefix}pl create MyPlaylist*`;
        } else {
          msg += `🎵 *Your Playlists:*\n`;
          pls.forEach((pl, i) => {
            msg += `${i + 1}. *${pl.name}* (${pl.songs.length} songs)\n`;
          });
        }

        return Miku.sendMessage(m.from, { text: msg }, { quoted: m });
      } catch (err) {
        console.error(err);
        return Miku.sendMessage(m.from, { text: `❌ Error while retrieving playlists.` }, { quoted: m });
      }
    }

    // match ke andar se action aur values nikaalo
    const action = match[1].toLowerCase();
    const playlistName = match[2];
    const songQuery = match[3];

    switch (action) {
      // 📌 CREATE
      case "create":
        if (!playlistName) return Miku.sendMessage(m.from, { text: `❌ Please provide a playlist name!` }, { quoted: m });

        try {
          const newPlaylist = new playlist({
            name: playlistName,
            owner: m.sender,
            songs: []
          });

          await newPlaylist.save();
          Miku.sendMessage(m.from, { text: `✅ Playlist *${playlistName}* created successfully nya~ 🎶` }, { quoted: m });
        } catch (err) {
          console.error(err);
          Miku.sendMessage(m.from, { text: `❌ Error while creating playlist.` }, { quoted: m });
        }
        break;

      // 📌 ADD SONG
      case "add":
        if (!playlistName) return Miku.sendMessage(m.from, { text: `❌ Provide playlist name.` }, { quoted: m });
        if (!songQuery) return Miku.sendMessage(m.from, { text: `❌ Provide song name or URL.` }, { quoted: m });

        try {
          const songInfo = await yts(songQuery);
          const song = songInfo.videos[0];
          if (!song) return Miku.sendMessage(m.from, { text: `❌ Could not find that song.` }, { quoted: m });

          const pl = await playlist.findOne({ name: playlistName, owner: m.sender });
          if (!pl) return Miku.sendMessage(m.from, { text: `❌ Playlist *${playlistName}* not found.` }, { quoted: m });

          pl.songs.push({
            title: song.title,
            url: song.url,
            savedAt: new Date()
          });

          await pl.save();
          Miku.sendMessage(m.from, { text: `✅ Added *${song.title}* to playlist *${playlistName}* nya~ 🎶` }, { quoted: m });
        } catch (err) {
          console.error(err);
          Miku.sendMessage(m.from, { text: `❌ Error while adding song.` }, { quoted: m });
        }
        break;

      // 📌 REMOVE SONG
      case "remove":
        if (!playlistName) return Miku.sendMessage(m.from, { text: `❌ Provide playlist name.` }, { quoted: m });
        if (!songQuery) return Miku.sendMessage(m.from, { text: `❌ Provide song URL to remove.` }, { quoted: m });

        try {
          const pl = await playlist.findOne({ name: playlistName, owner: m.sender });
          if (!pl) return Miku.sendMessage(m.from, { text: `❌ Playlist not found.` }, { quoted: m });

          const before = pl.songs.length;
          pl.songs = pl.songs.filter(s => s.url !== songQuery);
          await pl.save();

          if (pl.songs.length < before) {
            Miku.sendMessage(m.from, { text: `✅ Song removed from *${playlistName}*.` }, { quoted: m });
          } else {
            Miku.sendMessage(m.from, { text: `❌ Song not found in *${playlistName}*.` }, { quoted: m });
          }
        } catch (err) {
          console.error(err);
          Miku.sendMessage(m.from, { text: `❌ Error while removing song.` }, { quoted: m });
        }
        break;

      // 📌 VIEW SONGS
      case "view":
        if (!playlistName) return Miku.sendMessage(m.from, { text: `❌ Provide playlist name.` }, { quoted: m });

        try {
          const pl = await playlist.findOne({ name: playlistName, owner: m.sender });
          if (!pl) return Miku.sendMessage(m.from, { text: `❌ Playlist not found.` }, { quoted: m });

          if (pl.songs.length === 0) {
            return Miku.sendMessage(m.from, { text: `🧣 Playlist *${playlistName}* is empty nya~` }, { quoted: m });
          }

          let msg = `🎵 *Songs in ${playlistName}* 🎵\n\n`;
          pl.songs.forEach((s, i) => {
            msg += `${i + 1}. *${s.title}*\n🔗 ${s.url}\n📅 Added: ${s.savedAt.toDateString()}\n\n`;
          });

          msg += `✨ To remove: *${prefix}pl remove ${playlistName} songURL*\n`;
          msg += `✨ To delete playlist: *${prefix}pl delete ${playlistName}*`;

          Miku.sendMessage(m.from, { text: msg }, { quoted: m });
        } catch (err) {
          console.error(err);
          Miku.sendMessage(m.from, { text: `❌ Error while viewing playlist.` }, { quoted: m });
        }
        break;

      // 📌 DELETE PLAYLIST
      case "delete":
        if (!playlistName) return Miku.sendMessage(m.from, { text: `❌ Please provide the playlist name to delete nya~` }, { quoted: m });

        try {
          const deleted = await playlist.findOneAndDelete({ name: playlistName, owner: m.sender });

          if (!deleted) {
            return Miku.sendMessage(m.from, { text: `❌ Playlist *${playlistName}* not found nya~` }, { quoted: m });
          }

          Miku.sendMessage(m.from, { text: `🗑️ Playlist *${playlistName}* has been deleted successfully, ${pushName}-chan 🎶` }, { quoted: m });
        } catch (err) {
          console.error(err);
          Miku.sendMessage(m.from, { text: `❌ Error while deleting playlist.` }, { quoted: m });
        }
        break;
    }
  }
};