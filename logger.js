const fs = require('fs');
const path = require('path');

class Logger {
  constructor(file = 'errors.log') {
    this.path = path.join(process.cwd(), file); // caminho absoluto na raiz
  }

  _time() {
    return new Date().toISOString();
  }

  async log(level, context, error) {
    const msg = `[${this._time()}] ${level} | ${context} | ${error instanceof Error ? error.stack : error}\n`;
    fs.appendFileSync(this.path, msg);
    console.log(msg);
  }

  error(context, err) { return this.log('ERROR', context, err); }
  info(context, msg) { return this.log('INFO', context, msg); }
}

module.exports = Logger;