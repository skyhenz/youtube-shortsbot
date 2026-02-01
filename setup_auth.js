import AuthManager from './scripts/auth_manager.js';
import express from 'express';
import open from 'open';

import config from './config/config.js';

const app = express();
const redirectUrl = new URL(config.youtube.redirectUri);
const port = redirectUrl.port || 3000;
const auth = new AuthManager();

app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (code) {
        try {
            await auth.getTokenFromCode(code);
            res.send('<h1>Authentication Successful!</h1><p>You can close this window now and check your config/token.json.</p>');
            console.log('✅ Tokens saved to config/token.json');
            process.exit(0);
        } catch (error) {
            res.status(500).send('Authentication failed: ' + error.message);
            console.error('❌ Error getting token:', error.message);
        }
    } else {
        res.status(400).send('No code provided');
    }
});

app.listen(port, () => {
    const url = auth.generateAuthUrl();
    console.log(`\n🚀 YouTube Auth Setup`);
    console.log(`1. Opening browser for authorization...`);
    console.log(`2. If it doesn't open automatically, visit:\n${url}\n`);
    open(url);
});
