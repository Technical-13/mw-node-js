@echo off
setlocal
set /p plain_pass="Enter your Wiki Password: "

node -e "const crypto = require('node:crypto'); const fs = require('fs'); const dotenv = require('dotenv'); const envConfig = dotenv.parse(fs.readFileSync('../.env')); const key = Buffer.from(envConfig.WIKI_ENCRYPTION_KEY, 'hex'); const iv = crypto.randomBytes(16); const cipher = crypto.createCipheriv('aes-256-cbc', key, iv); let enc = cipher.update('%plain_pass%', 'utf8', 'hex'); enc += cipher.final('hex'); console.log('\n--- Copy these to wikiconfig.json ---'); console.log('encryptedPassword: ' + enc); console.log('iv: ' + iv.toString('hex'));"

pause
