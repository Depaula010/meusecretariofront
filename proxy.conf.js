// Proxy do `ng serve`. A chave do bot (X-API-Key) vem da variável de ambiente BOT_API_KEY e nunca fica no código.
//   PowerShell:  $env:BOT_API_KEY = "<chave do tenant meu-secretario>"; ng serve
//   Git Bash:    BOT_API_KEY=<chave> ng serve
const BACKEND = 'http://212.47.65.37';
const BOT = 'http://212.47.65.37:3001'; // whatsapp-saas-bot

// Lê BOT_API_KEY de .env.local (gitignored) e ele vence uma BOT_API_KEY antiga que tenha ficado no terminal.
try {
  const text = require('fs').readFileSync(require('path').join(__dirname, '.env.local'), 'utf8');
  for (const line of text.split(String.fromCharCode(10))) {
    const m = line.match(/^\s*BOT_API_KEY\s*=\s*(.*?)\s*$/);
    if (m && m[1]) process.env.BOT_API_KEY = m[1].trim().replace(/^["']|["']$/g, '');
  }
} catch (e) { /* sem .env.local: segue só com a variável de ambiente */ }

const botHeaders = {};
if (process.env.BOT_API_KEY) {
  botHeaders['X-API-Key'] = process.env.BOT_API_KEY;
} else {
  console.warn('[proxy] BOT_API_KEY não definida: a tela de sessões do WhatsApp responderá 401.');
}

module.exports = {
  '/api': { target: BACKEND, secure: false, changeOrigin: true, logLevel: 'debug' },
  '/auth': { target: BACKEND, secure: false, changeOrigin: true, logLevel: 'debug' },
  '/bot-api': {
    target: BOT,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: { '^/bot-api': '' },
    headers: botHeaders,
  },
};
