const { color } = require('../lib/color.js')

module.exports = async (sock, update) => {
    try {
        const { id, participants, action } = update
        
        for (const participant of participants) {
            const user = participant.split('@')[0]
            
            // Welcome message
            if (action === 'add' && global.config?.features?.welcome) {
                await sock.sendMessage(id, {
                    text: `Selamat datang @${user} di grup! 🎉\n\nJangan lupa baca rules grup ya!`,
                    mentions: [participant]
                })
            }
            
            // Goodbye message
            else if (action === 'remove' && global.config?.features?.goodbye) {
                await sock.sendMessage(id, {
                    text: `Selamat tinggal @${user} 👋\nSemoga sukses selalu!`,
                    mentions: [participant]
                })
            }
        }
        
        console.log(color(`[GROUP] ${action}: ${participants.length} participants`, 'yellow'))
        
    } catch (error) {
        console.error(color('[ERROR] Group handler:', 'red'), error)
    }
          }
