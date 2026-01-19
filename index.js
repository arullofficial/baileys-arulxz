const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys')

const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const figlet = require('figlet')

// Config
const config = require('./config.js')
const { color, bgcolor } = require('./lib/color.js')

// Handler
const messageHandler = require('./handler/message.js')
const groupHandler = require('./handler/group.js')

// Database
const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.database)

// Store
const store = require('./store/store.js')

// Auto updater
require('./lib/update.js')

// Clear console and show banner
console.clear()
console.log(chalk.yellow(figlet.textSync('BAILEYS MD', { horizontalLayout: 'full' })))
console.log(color(`\n> Version : 6.5.0`, 'cyan'))
console.log(color(`> Author  : ${config.author}`, 'cyan'))
console.log(color(`> Prefix  : ${config.prefix}\n`, 'cyan'))

async function startBot() {
    // Auth state
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    
    console.log(color(`Using WA v${version.join('.')}, isLatest: ${isLatest}`, 'magenta'))
    
    // Create socket
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
        },
        browser: Browsers.ubuntu('Chrome'),
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        getMessage: async (key) => {
            return {}
        }
    })
    
    // Store globally
    global.sock = sock
    global.store = store
    store.bind(sock.ev)
    
    // Update credentials
    sock.ev.on('creds.update', saveCreds)
    
    // Connection update
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        // QR Code
        if (qr) {
            console.log(color('\n[!] Scan QR Code Berikut :', 'yellow'))
            require('qrcode-terminal').generate(qr, { small: true })
        }
        
        // Connection closed
        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut
            
            console.log(color(`[!] Connection closed: ${lastDisconnect.error?.message}`, 'red'))
            console.log(color(`[!] Reconnecting: ${shouldReconnect}`, 'yellow'))
            
            if (shouldReconnect) {
                setTimeout(() => {
                    console.log(color('[+] Reconnecting...', 'cyan'))
                    startBot()
                }, 5000)
            }
        }
        
        // Connected
        if (connection === 'open') {
            console.log(color('[+] Connected to WhatsApp!', 'green'))
            console.log(color(`[+] User: ${sock.user?.name || 'Unknown'}`, 'cyan'))
            console.log(color(`[+] Number: ${sock.user?.id.split(':')[0] || 'Unknown'}`, 'cyan'))
            
            // Send to owner
            if (config.owner) {
                await sock.sendMessage(`${config.owner}@s.whatsapp.net`, {
                    text: `*🤖 BOT ONLINE*\n\nBot telah aktif!\n• User: ${sock.user?.name}\n• Time: ${new Date().toLocaleString()}\n• Version: ${version.join('.')}`
                })
            }
        }
    })
    
    // Messages
    sock.ev.on('messages.upsert', async (m) => {
        await messageHandler(sock, m)
    })
    
    // Group participants update
    sock.ev.on('group-participants.update', async (update) => {
        await groupHandler(sock, update)
    })
    
    // Calls
    sock.ev.on('call', async (call) => {
        const from = call[0].from
        console.log(color(`[!] Missed call from: ${from}`, 'red'))
        // Auto reject
        await sock.rejectCall(call[0].id, from)
    })
    
    // Error handler
    process.on('uncaughtException', (err) => {
        console.error(color('[!] Uncaught Exception:', 'red'), err)
    })
    
    process.on('unhandledRejection', (err) => {
        console.error(color('[!] Unhandled Rejection:', 'red'), err)
    })
}

// Start bot
startBot().catch(console.error)
