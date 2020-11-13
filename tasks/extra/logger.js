const chalk = require('chalk')
const red = chalk.hex('#d73a49')
const orange = chalk.hex('#ffa000')

function warn(message) {
  console.warn(orange(`${chalk.bold('WARN :')} ${message}`))
}

function error(message) {
  console.error(red(`${chalk.bold('ERROR:')} ${message}`))
}

module.exports = {
  warn: warn,
  error: error
}