module.exports = {
  name: "charlist",
  alias: ["characterlist", "botcharacterlist"],
  desc: "Set Char According to your choise",
  category: "Mods",
  usage: "setchar 0/1/2/3/4/5",
  react: "🐼",
  start: async (Miku, m, { text, prefix ,modStatus}) => {

    let txt = `       『  *Bot Charactes*  』\n\n\n_0 - Marin MD_\n\n_1 - Makima MD_\n\n_2 - Chika MD_\n\n_3 - Miku MD_\n\n_4 - Atlas MD_\n\n_5 - Yor MD_\n\n\nExample: *${prefix}setchar 5* or choose button below.\n`;

    let botLogos = [
        'https://c4.wallpaperflare.com/wallpaper/523/235/790/anime-anime-girls-red-eyes-wallpaper-preview.jpg',
      'https://wallpapercave.com/cdn-cgi/mirage/4060d9c58e8c34505929baac680386a213cfd243a199f1ff8f223c312de6c835/1280/https://wallpapercave.com/wp/wp11253602.jpg',
      'https://images5.alphacoders.com/126/1264439.jpg',
      'https://c4.wallpaperflare.com/wallpaper/280/659/612/highschool-dxd-gremory-rias-wallpaper-preview.jpg',
      'https://images3.alphacoders.com/949/949253.jpg',
      'https://images4.alphacoders.com/100/1002134.png',
      'https://wallpapercave.com/cdn-cgi/mirage/4060d9c58e8c34505929baac680386a213cfd243a199f1ff8f223c312de6c835/1280/https://wallpapercave.com/wp/wp10524620.jpg',
      'https://wallpapercave.com/cdn-cgi/mirage/4060d9c58e8c34505929baac680386a213cfd243a199f1ff8f223c312de6c835/1280/https://wallpapercave.com/wp/wp10472416.png',
        'https://wallpapers.com/images/file/kiyotaka-ayanokoji-in-pink-qs33qgqm79ccsq7n.jpg',
        'https://wallpapercave.com/wp/wp8228630.jpg',
        'https://images3.alphacoders.com/128/1288059.png',
        'https://images.alphacoders.com/711/711900.png',
        'https://moewalls.com/wp-content/uploads/2022/07/sumi-sakurasawa-hmph-rent-a-girlfriend-thumb.jpg',
        'https://wallpapercave.com/wp/wp6099650.png',
        'https://wallpapercave.com/wp/wp5017991.jpg',
        'https://wallpapercave.com/wp/wp2535489.jpg',
        'https://images4.alphacoders.com/972/972790.jpg',
        'https://images7.alphacoders.com/123/1236729.jpg',
        'https://wallpapercave.com/wp/wp4650481.jpg',
        'https://images8.alphacoders.com/122/1229829.jpg'
    ];

    let randomimage = botLogos[Math.floor(Math.random() * botLogos.length)];
   
    let sections = [] 
    let chars = ['Marin MD', 'Makima', 'Chika', 'Miku', 'Atlas MD', 'Yor MD']
    let buttonDesc =[`Set bot character to Marin MD`, `Set bot character to Makima`, `Set bot character to Chika`, `Set bot character to Miku`, `Set bot character to Atlas MD`, `Set bot character to Yor MD`]
    let buttonTexts = [`${prefix}setchar 0`, `${prefix}setchar 1`, `${prefix}setchar 2`, `${prefix}setchar 3`, `${prefix}setchar 4`, `${prefix}setchar 5`]
    
    for (let i = 0; i < chars.length; i++) {
        const list = {title: `${prefix}setchar ${i}`,
        rows: [
        
                {
                 title: `${chars[i]}`, 
                 rowId: `${buttonTexts[i]}`,
                 description: `${buttonDesc[i]}`
                }
                ]
             }
                sections.push(list)
            }


    let buttonMessage = {
      //image: { url: randomimage },
      text: txt,
      footer: `*${botName}*`,
      buttonText: "Choose Character",
      sections,
    };

    Miku.sendMessage(m.from, buttonMessage, { quoted: m });
  },
};