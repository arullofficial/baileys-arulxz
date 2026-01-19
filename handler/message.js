const fs = require('fs')
const axios = require('axios')
const { color } = require('../lib/color.js')

module.exports = async (sock, m) => {
    try {
        const msg = m.messages[0]
        if (!msg.message) return
        
        const from = msg.key.remoteJid
        const type = Object.keys(msg.message)[0]
        const isGroup = from.endsWith('@g.us')
        const isOwner = msg.key.fromMe || (global.config?.owner && from.includes(global.config.owner))
        const sender = isGroup ? msg.key.participant : from
        const pushName = msg.pushName || 'User'
        
        // Extract text
        let body = ''
        if (type === 'conversation') body = msg.message.conversation
        if (type === 'extendedTextMessage') body = msg.message.extendedTextMessage.text
        
        // Log
        console.log(color(`[${isGroup ? 'GROUP' : 'PRIVATE'}] ${pushName}: ${body || type}`, 'cyan'))
        
        // Auto read
        if (global.config?.features?.autoRead) {
            await sock.readMessages([msg.key])
        }
        
        // Command handler
        if (body.startsWith(global.config?.prefix || '.')) {
            const cmd = body.slice(global.config.prefix.length).trim().split(' ')[0].toLowerCase()
            const args = body.slice(global.config.prefix.length + cmd.length).trim()
            
            // PING
            if (cmd === 'ping') {
                const start = Date.now()
                await sock.sendMessage(from, { text: 'Pong! 🏓' })
                const latency = Date.now() - start
                await sock.sendMessage(from, {
                    text: `*PONG!*\n🏓 Latency: ${latency}ms\n⚡ Speed: Excellent`
                })
            }
            
            // MENU
            else if (cmd === 'menu' || cmd === 'help') {
                const menu = `*🤖 ${global.config.name.toUpperCase()} MENU*

*📊 INFO*
\`\`\`${global.config.prefix}menu\`\`\` - Show this menu
\`\`\`${global.config.prefix}ping\`\`\` - Test bot speed
\`\`\`${global.config.prefix}owner\`\`\` - Contact owner
\`\`\`${global.config.prefix}status\`\`\` - Bot status

*🎬 DOWNLOADER*
\`\`\`${global.config.prefix}tiktok <url>\`\`\` - Download TikTok
\`\`\`${global.config.prefix}ytmp4 <url>\`\`\` - Download YouTube MP4
\`\`\`${global.config.prefix}ytmp3 <url>\`\`\` - Download YouTube MP3

*👥 GROUP*
\`\`\`${global.config.prefix}kick @tag\`\`\` - Kick member
\`\`\`${global.config.prefix}promote @tag\`\`\` - Promote to admin
\`\`\`${global.config.prefix}demote @tag\`\`\` - Demote admin
\`\`\`${global.config.prefix}tagall\`\`\` - Mention all members

*🛠️ OWNER*
\`\`\`${global.config.prefix}eval <code>\`\`\` - Execute code
\`\`\`${global.config.prefix}> <cmd>\`\`\` - Terminal
\`\`\`${global.config.prefix}bc <text>\`\`\` - Broadcast

*🔧 OTHER*
\`\`\`${global.config.prefix}sticker\`\`\` - Create sticker
\`\`\`${global.config.prefix}toimg\`\`\` - Convert sticker to image
\`\`\`${global.config.prefix}quote\`\`\` - Random quote

_By ${global.config.author}_`
                
                await sock.sendMessage(from, { text: menu })
            }
            
            // STATUS
            else if (cmd === 'status' || cmd === 'info') {
                const uptime = process.uptime()
                const hours = Math.floor(uptime / 3600)
                const minutes = Math.floor((uptime % 3600) / 60)
                const seconds = Math.floor(uptime % 60)
                
                const status = `*🤖 BOT STATUS*

*• Runtime:* ${hours}h ${minutes}m ${seconds}s
*• Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
*• Platform:* ${process.platform}
*• Node.js:* ${process.version}
*• Prefix:* ${global.config.prefix}
*• Owner:* ${global.config.owner}

*📊 CONNECTION*
• User: ${sock.user?.name || 'Unknown'}
• Number: ${sock.user?.id.split(':')[0] || 'Unknown'}
• Connection: ✅ Stable

_Github: @arullofficial_`
                
                await sock.sendMessage(from, { text: status })
            }
            
            // STICKER
            else if (cmd === 'sticker' || cmd === 's') {
                await sock.sendMessage(from, {
                    text: 'Kirim gambar dengan caption .sticker atau tag gambar yang sudah dikirim'
                })
            }
            
            // TIKTOK DOWNLOADER
            else if (cmd === 'tiktok') {
                if (!args) return sock.sendMessage(from, { text: 'Masukkan URL TikTok!' })
                
                await sock.sendMessage(from, { text: '📥 Downloading TikTok...' })
                
                try {
                    // Using API
                    const api = `https://api.tiktokvip.eu.org/api?url=${encodeURIComponent(args)}`
                    const { data } = await axios.get(api)
                    
                    if (data.video) {
                        await sock.sendMessage(from, {
                            video: { url: data.video },
                            caption: `*TIKTOK DOWNLOADER*\n\n• Author: ${data.author || 'Unknown'}\n• Desc: ${data.desc || 'No description'}`
                        })
                    }
                } catch (error) {
                    await sock.sendMessage(from, { text: '❌ Gagal mendownload TikTok!' })
                }
            }
            
            // OWNER COMMANDS (Restricted)
            else if (cmd === 'eval' && isOwner) {
                try {
                    const result = eval(args)
                    await sock.sendMessage(from, { text: `Result:\n\`\`\`${result}\`\`\`` })
                } catch (error) {
                    await sock.sendMessage(from, { text: `Error:\n\`\`\`${error}\`\`\`` })
                }
            }
            
            else if (cmd === '>' && isOwner) {
                const { exec } = require('child_process')
                exec(args, (error, stdout, stderr) => {
                    const result = error ? stderr : stdout
                    sock.sendMessage(from, { text: `Terminal:\n\`\`\`${result}\`\`\`` })
                })
            }
            
            else if (cmd === 'bc' && isOwner) {
                if (!args) return sock.sendMessage(from, { text: 'Masukkan pesan!' })
                
                const chats = await sock.groupFetchAllParticipating()
                let total = 0
                
                for (const group of Object.values(chats)) {
                    try {
                        await sock.sendMessage(group.id, { text: args })
                        total++
                        console.log(`[BC] Sent to: ${group.subject}`)
                    } catch (e) {}
                }
                
                await sock.sendMessage(from, { text: `✅ Broadcast sent to ${total} groups` })
            }
            
            // If command not found
            else {
                await sock.sendMessage(from, {
                    text: `❌ Command \`${cmd}\` tidak ditemukan!\nKetik \`${global.config.prefix}menu\` untuk melihat daftar command.`
                })
            }
        }
        
        // Auto reply for non-command
        else if (body && !msg.key.fromMe && !isGroup) {
            const replies = [
                "Halo! Saya bot WhatsApp 🤖",
                "Ketik .menu untuk melihat perintah",
                "Ada yang bisa saya bantu?",
                "Bot online! 🟢"
            ]
            const randomReply = replies[Math.floor(Math.random() * replies.length)]
            await sock.sendMessage(from, { text: randomReply })
        }
        
    } catch (error) {
        console.error(color('[ERROR] Message handler:', 'red'), error)
    }
}
