module.exports = {
    // Bot Info
    name: 'KIUUR BOT',
    author: 'kiuur',
    version: '2.0.0',
    
    // Settings
    prefix: '.',
    owner: '628xxxxxx', // Ganti dengan nomor kamu
    sessionName: 'session',
    
    // Database
    database: {
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false
    },
    
    // API Keys
    apis: {
        ai: 'YOUR_OPENAI_KEY',
        tiktok: 'https://api.tiktokvip.eu.org',
        youtube: 'https://api.ryzendesu.vip',
        stickers: 'https://api.ryzendesu.vip'
    },
    
    // Features
    features: {
        autoRead: true,
        autoTyping: false,
        autoRecording: false,
        antiCall: true,
        antiDelete: false,
        welcome: true,
        goodbye: true
    },
    
    // Messages
    messages: {
        welcome: 'Hai @user, selamat datang di grup! 🎉',
        goodbye: 'Selamat tinggal @user 👋',
        ownerOnly: '❌ Command ini hanya untuk owner!',
        groupOnly: '❌ Command ini hanya untuk grup!',
        privateOnly: '❌ Command ini hanya untuk private chat!',
        adminOnly: '❌ Hanya admin yang bisa menggunakan command ini!',
        botAdmin: '❌ Bot harus menjadi admin terlebih dahulu!',
        error: '❌ Terjadi kesalahan!',
        done: '✅ Done!',
        wait: '⏳ Sedang diproses...'
    },
    
    // Limit
    limit: {
        free: 20,
        premium: 1000,
        owner: 999999
    },
    
    // Social Media
    socials: {
        github: 'https://github.com/kiuur',
        instagram: 'https://instagram.com/kiuur',
        youtube: 'https://youtube.com/@kiuur'
    }
}
