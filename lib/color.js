const chalk = require('chalk')

const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

const bgcolor = (text, bgcolor) => {
    return !bgcolor ? chalk.green(text) : chalk.bgKeyword(bgcolor)(text)
}

const banner = `
██████╗  █████╗ ██╗██╗     ███████╗██╗   ██╗███████╗
██╔══██╗██╔══██╗██║██║     ██╔════╝╚██╗ ██╔╝██╔════╝
██████╔╝███████║██║██║     █████╗   ╚████╔╝ ███████╗
██╔══██╗██╔══██║██║██║     ██╔══╝    ╚██╔╝  ╚════██║
██████╔╝██║  ██║██║███████╗███████╗   ██║   ███████║
╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝   ╚═╝   ╚══════╝
`

module.exports = {
    color,
    bgcolor,
    banner
}
