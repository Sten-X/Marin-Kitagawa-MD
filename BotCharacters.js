const fs = require("fs");
const { mkchar } = require("./Database/dataschema.js");


/* ---Added Anime Character list---  /

 0 --- Marin MD
 1 --- Makima
 2 --- Chika
 3 --- Miku
 4 --- Atlas MD
 5 --- Yor

Image Source: https://wall.alphacoders.com/
Image Source: https://wallpapercave.com/

*/


global.charID0 = {
  botName : "Marin MD",
  botVideo : fs.readFileSync("./Assets/marin.mp4"),
  botImage1 : "https://images2.alphacoders.com/125/1257915.jpg",
  botImage2 : "https://wallpapercave.com/wp/wp10472356.png",
  botImage3 : "https://images7.alphacoders.com/121/1210002.png",
  botImage4 : "https://images8.alphacoders.com/122/1223407.jpg",
  botImage5 : "https://images7.alphacoders.com/121/1211490.jpg",
  botImage6 : "https://images3.alphacoders.com/122/1223868.png",
  }

global.charID1 = {
  botName : "Makima MD",
  botVideo : fs.readFileSync("./Assets/makima.mp4"),
  botImage1 : "https://images5.alphacoders.com/126/1264439.jpg",
  botImage2 : "https://images8.alphacoders.com/122/1227171.jpg",
  botImage3 : "https://wallpapercave.com/wp/wp9666940.png",
  botImage4 : "https://images6.alphacoders.com/123/1238644.jpg",
  botImage5 : "https://images2.alphacoders.com/128/1280153.jpg",
  botImage6 : "https://images7.alphacoders.com/129/1292566.png",
}

global.charID2 = {
  botName : "Chika MD",
  botVideo : fs.readFileSync("./Assets/chika.mp4"),
  botImage1 : "https://images4.alphacoders.com/100/1002134.png",
  botImage2 : "https://images4.alphacoders.com/100/1002714.jpg",
  botImage3 : "https://images7.alphacoders.com/107/1071650.jpg",
  botImage4 : "https://images3.alphacoders.com/127/1272368.png",
  botImage5 : "https://images3.alphacoders.com/122/1225194.png",
  botImage6 : "https://wallpapercave.com/wp/wp4624851.jpg",
}

global.charID3 = {
  botName : "Miku MD",
  botVideo : fs.readFileSync("./Assets/miku.mp4"),
  botImage1 : "https://wallpapercave.com/wp/wp10524580.jpg",
  botImage2 : "https://wallpapercave.com/wp/wp4828029.jpg",
  botImage3 : "https://images4.alphacoders.com/102/1026046.jpg",
  botImage4 : "https://wallpapercave.com/uwp/uwp1229563.jpeg",
  botImage5 : "https://images7.alphacoders.com/129/1294874.jpg",
  botImage6 : "https://wallpapercave.com/wp/wp5758284.jpg",
}

global.charID4 = {
    botName : "Atlas MD",
    botVideo : fs.readFileSync("./Assets/atlas.mp4"),
    botImage1 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
    botImage2 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
    botImage3 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
    botImage4 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
    botImage5 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
    botImage6 : "https://i.ibb.co/r2dyh2S/20230213-154752.jpg",
}

global.charID5 = {
  botName : "Yor MD",
  botVideo : fs.readFileSync("./Assets/yor.mp4"),
  botImage1 : "https://images7.alphacoders.com/123/1236729.jpg",
  botImage2 : "https://images7.alphacoders.com/122/1229718.jpg",
  botImage3 : "https://images.alphacoders.com/123/1238264.jpg",
  botImage4 : "https://images4.alphacoders.com/123/1233274.jpg",
  botImage5 : "https://images.alphacoders.com/124/1241835.png",
  botImage6 : "https://images4.alphacoders.com/123/1235462.jpg",
}