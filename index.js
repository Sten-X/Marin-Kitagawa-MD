require("./config.js");
require("./Core.js");

// --- 1. CORE MODULES ---
const fs = require("fs");
const path = require("path");
const { join } = require("path");
const readline = require("readline"); // Input lene ke liye
const { exec, spawn, execSync } = require("child_process");

// --- 2. THIRD PARTY MODULES ---
const pino = require('pino');
const chalk = require("chalk");
const figlet = require('figlet');
const FileType = require('file-type');
const express = require("express");
const { Boom } = require("@hapi/boom");
const moment = require('moment-timezone');
const PhoneNumber = require('awesome-phonenumber');
const mongoose = require("mongoose");
const qrcode = require('qrcode');
const Jimp = require('jimp');
const yargs = require("yargs");
const CFonts = require('cfonts');

// --- 3. BAILEYS MODULES ---
const {
    default: MikuConnect,
    DisconnectReason,
    delay,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    downloadContentFromMessage,
    jidDecode,
    proto,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID
} = require("@adiwajshing/baileys");

// --- 4. INTERNAL MODULES ---
const { startAutoSpawn } = require('./lib/autospawn.js');
const { startPokeAutoSpawn } = require('./lib/pokeAutoSpawn.js');
const {
    smsg,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetchJson,
    await,
    sleep
} = require('./lib/myfunc');
const {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid
} = require('./lib/exif');
const {
    Collection,
    Simple
} = require("./lib");
const {
    serialize,
    WAConnection
} = Simple;
const { color } = require('./lib/color');
const Auth = require('./Processes/Auth');
const welcomeLeft = require('./Processes/welcome.js');

// --- 5. CONFIGURATION ---
const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
});
const prefix = global.prefa;
const Commands = new Collection();
Commands.prefix = prefix;
const { clear } = require("console");

// --- 6. COMMAND LOADER ---
const readCommands = () => {
    let dir = path.join(__dirname, "./Commands")
    let dirs = fs.readdirSync(dir)
    let cmdlist = {}
    try {
        dirs.forEach(async (res) => {
            let groups = res.toLowerCase()
            Commands.category = dirs.filter(v => v !== "_").map(v => v)
            cmdlist[groups] = []
            let files = fs.readdirSync(`${dir}/${res}`).filter((file) => file.endsWith(".js"))
            for (const file of files) {
                const command = require(`${dir}/${res}/${file}`)
                cmdlist[groups].push(command)
                Commands.set(command.name, command)
                delay(100)
            }
        })
        Commands.list = cmdlist
    } catch (eerror) {
        console.error("An error occured!")
    }
}
readCommands()

// --- 7. INPUT INTERFACE ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// --- 8. SERVER ---
const PORT = global.port || 3000;
const app = express();
let QR_GENERATE = "invalid";
let status;

// --- 9. MAIN FUNCTION ---
async function startMiku() {
    // 1. Database Connect
    await mongoose.connect(global.mongodb)

    // 2. Auth Load (Ye MongoDB se data layega)
    const {
        getAuthFromDatabase
    } = new Auth(global.sessionId)

    const {
        saveState,
        state,
        clearState,
    } = await getAuthFromDatabase()

    console.log(color(figlet.textSync('Marin MD BOT', {
        font: 'Pagga',
        horizontalLayout: 'default',
        vertivalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    }), 'yellow'))

    console.log(color('\nHello, I am Sten-X, the main developer of this bot.\n\nThanks for using: Marin MD made by Sten-X.', 'aqua'))
    console.log(color('\nYou can follow me on GitHub: Sten-X\n\n', 'aqua'))

    // PAIRING LOGIC 
  
    let usePairingCode = false;
    let phoneNumber = "";

    // IMPORTANT: Hum check kar rahe hain ki kya 'state.creds.me' exist karta hai?
    const isSessionExists = state && state.creds && state.creds.me && state.creds.me.id;

    if (!isSessionExists) {
        // Session nahi mila, iska matlab naya login chahiye
        console.log(chalk.yellow.bold("\n--- 🔒 LOGIN CONFIGURATION ---"));
        console.log(chalk.white("1. Scan QR Code"));
        console.log(chalk.white("2. Use Pairing Code"));
        
        let choice = await question(chalk.greenBright("\nEnter option (1 or 2): "));

        if (choice.trim() === '2') {
            usePairingCode = true;
            phoneNumber = await question(chalk.greenBright("Enter your WhatsApp Number (e.g. 918888888888): "));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, ""); 
            console.log(chalk.magenta(`\nRequesting Pairing Code for: ${phoneNumber}...`));
        }
    }
    // ============================================================


    let {
        version,
        isLatest
    } = await fetchLatestBaileysVersion()
    
    const Miku = MikuConnect({
        logger: pino({
            level: 'silent'
        }),
        printQRInTerminal: !usePairingCode, // Pairing use kar rahe ho to QR mat dikhao
        // Browser fix: Pairing code ke liye 'Ubuntu'/'Chrome' zaroori hai
        browser: usePairingCode ? ['Ubuntu', 'Chrome', '20.0.04'] : ['Marin MD', 'Safari', '1.0.0'],
        auth: state,
        version
    })

    // --- REQUEST PAIRING CODE ---
    if (usePairingCode && !isSessionExists) {
        setTimeout(async () => {
            try {
                let code = await Miku.requestPairingCode(phoneNumber, 'STENX001');
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.black.bgGreen(`\n YOUR PAIRING CODE: `), chalk.black.bgWhite(` ${code} `));
            } catch (err) {
                console.log(chalk.red("Error fetching pairing code: " + err.message));
            }
        }, 4000);
    }
    
    const _sendMessage = Miku.sendMessage.bind(Miku)

    Miku.sendMessage = async (jid, msg, options = {}) => {
        try {
            if (
                msg &&
                typeof msg === "object" &&
                msg.text &&
                !msg.contextInfo
            ) {
                msg.contextInfo = {
                    externalAdReply: {
                        title: "Marin-MD • Multi-Device Bot",
                        body: "Owner - Sten-X",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: global.botImage6, 
                        sourceUrl: "https://github.com/Sten-X"
                    }
                }
            }
        } catch (e) {
            console.log("extAd wrapper error:", e.message)
        }

        return _sendMessage(jid, msg, options)
    }
    
    startAutoSpawn(Miku); 
    startPokeAutoSpawn(Miku)
    
    store.bind(Miku.ev)

    Miku.public = true
    Miku.ev.on('creds.update', saveState)
    Miku.serializeM = (m) => smsg(Miku, m, store)

    Miku.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect,
            qr
        } = update
        status = connection;
        if (connection) {
            await console.info(`Marin MD Server Status => ${connection}`);
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                startMiku();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server, reconnecting...");
                startMiku();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                process.exit();
            } else if (reason === DisconnectReason.loggedOut) {
                clearState()
                console.log(`Device Logged Out, Please Delete Session and Scan Again.`);
                process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                startMiku();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                startMiku();
            } else {
                console.log(`Disconnected: Reason "Probably your WhatsApp account Banned for Spamming !\n\nCheck your WhatsApp !"`)
            }
        }
        if (qr) {
            QR_GENERATE = qr;
        }
    })


    Miku.ev.on("group-participants.update", async (m) => {
        welcomeLeft(Miku, m);
    });

    Miku.ev.on("messages.upsert", async (chatUpdate) => {
        m = serialize(Miku, chatUpdate.messages[0])

        if (!m.message) return
        if (m.key && m.key.remoteJid == "status@broadcast") return
        if (m.key.id.startsWith("BAE5") && m.key.id.length == 16) return
        require("./Core.js")(Miku, m, Commands, chatUpdate)
    })


    Miku.getName = (jid, withoutContact = false) => {
        id = Miku.decodeJid(jid)
        withoutContact = Miku.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = Miku.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === Miku.decodeJid(Miku.user.id) ?
            Miku.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    Miku.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    Miku.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Miku.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    // --- HELPER FUNCTIONS ---
    
    Miku.send5ButImg = async (jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
        let message = await prepareWAMessageMedia({
            image: img,
            jpegThumbnail: thumb
        }, {
            upload: Miku.waUploadToServer
        })
        var template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options)
        Miku.relayMessage(jid, template.message, {
            messageId: template.key.id
        })
    }

    Miku.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        }
        Miku.sendMessage(jid, buttonMessage, {
            quoted,
            ...options
        })
    }

    Miku.sendText = (jid, text, quoted = '', options) => Miku.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted
    })

    Miku.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Miku.sendMessage(jid, {
            image: buffer,
            caption: caption,
            ...options
        }, {
            quoted
        })
    }

    Miku.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Miku.sendMessage(jid, {
            video: buffer,
            caption: caption,
            gifPlayback: gif,
            ...options
        }, {
            quoted
        })
    }

    Miku.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await Miku.sendMessage(jid, {
            audio: buffer,
            ptt: ptt,
            ...options
        }, {
            quoted
        })
    }

    Miku.sendTextWithMentions = async (jid, text, quoted, options = {}) => Miku.sendMessage(jid, {
        text: text,
        contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
        },
        ...options
    }, {
        quoted
    })

    Miku.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await Miku.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    Miku.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }
        await Miku.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        })
        return buffer
    }

    Miku.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await Miku.getFile(path, true)
        let { mime, ext, res, data, filename } = types
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
        }
        let type = '', mimetype = mime, pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./lib/exif')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, {
                packname: options.packname ? options.packname : global.packname,
                author: options.author ? options.author : global.author,
                categories: options.categories ? options.categories : []
            })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        } else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await Miku.sendMessage(jid, {
            [type]: { url: pathFile },
            caption,
            mimetype,
            fileName,
            ...options
        }, {
            quoted,
            ...options
        })
        return fs.promises.unlink(pathFile)
    }

    Miku.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    Miku.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    Miku.sendListMsg = (jid, text = '', footer = '', title = '', butText = '', sects = [], quoted) => {
        let sections = sects
        var listMes = { text: text, footer: footer, title: title, buttonText: butText, sections }
        Miku.sendMessage(jid, listMes, { quoted: quoted })
    }

    Miku.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' }
        filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return { res, filename, size: await getSizeMedia(data), ...type, data }
    }

    Miku.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await Miku.getFile(PATH, true)
        let { filename, size, ext, mime, data } = types
        let type = '', mimetype = mime, pathFile = filename
        if (options.asDocument) type = 'document'
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./lib/sticker.js')
            let media = { mimetype: mime, data }
            pathFile = await writeExif(media, {
                packname: global.packname,
                author: global.packname,
                categories: options.categories ? options.categories : []
            })
            await fs.promises.unlink(filename)
            type = 'sticker'
            mimetype = 'image/webp'
        } else if (/image/.test(mime)) type = 'image'
        else if (/video/.test(mime)) type = 'video'
        else if (/audio/.test(mime)) type = 'audio'
        else type = 'document'
        await Miku.sendMessage(jid, {
            [type]: { url: pathFile },
            mimetype,
            fileName,
            ...options
        }, {
            quoted,
            ...options
        })
        return fs.promises.unlink(pathFile)
    }
    Miku.parseMention = async (text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    return Miku
}

startMiku();

app.use("/", express.static(join(__dirname, "Page")));
app.get("/qr", async (req, res) => {
    const { session } = req.query;
    if (!session) return void res.status(404).send("Provide session id");
    if (global.sessionId !== session) return void res.status(404).send("Invalid session");
    if (status == "open") return void res.status(404).send("Session already exist");
    res.setHeader("content-type", "image/png");
    res.send(await qrcode.toBuffer(QR_GENERATE));
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`${__filename} Updated`))
    delete require.cache[file]
    require(file)
})