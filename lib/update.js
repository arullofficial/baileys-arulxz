const fs = require('fs')
const path = require('path')

function updateSession() {
    const sessionDir = './session'
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true })
    }
    
    // Check and clean old sessions
    const files = fs.readdirSync(sessionDir)
    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(sessionDir, file)
            const stats = fs.statSync(filePath)
            const now = new Date().getTime()
            const fileAge = now - stats.mtime.getTime()
            
            // Delete files older than 7 days
            if (fileAge > 7 * 24 * 60 * 60 * 1000) {
                fs.unlinkSync(filePath)
                console.log(`[UPDATE] Deleted old session: ${file}`)
            }
        }
    })
}

module.exports = updateSession()
