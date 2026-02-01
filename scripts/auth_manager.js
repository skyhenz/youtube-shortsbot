import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = path.join(process.cwd(), 'config', 'token.json');

export default class AuthManager {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            config.youtube.clientId,
            config.youtube.clientSecret,
            config.youtube.redirectUri
        );
    }

    /**
     * Get authorized client. It will automatically refresh if needed.
     */
    async getClient() {
        try {
            const tokenExists = await fs.access(TOKEN_PATH).then(() => true).catch(() => false);

            if (tokenExists) {
                const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
                const tokens = JSON.parse(tokenData);
                this.oauth2Client.setCredentials(tokens);

                // Auto-refresh if expired
                if (this.oauth2Client.isTokenExpiring()) {
                    console.log('🔄 Token expired, refreshing...');
                    const { credentials } = await this.oauth2Client.refreshAccessToken();
                    await this.saveTokens(credentials);
                }

                return this.oauth2Client;
            } else if (config.youtube.refreshToken) {
                // Fallback to .env refresh token if token.json is missing
                console.log('ℹ️ Using refresh token from .env');
                this.oauth2Client.setCredentials({
                    refresh_token: config.youtube.refreshToken
                });
                const { credentials } = await this.oauth2Client.refreshAccessToken();
                await this.saveTokens(credentials);
                return this.oauth2Client;
            } else {
                throw new Error('No authentication tokens found. Please run the setup-auth script.');
            }
        } catch (error) {
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async saveTokens(tokens) {
        await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    }

    generateAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });
    }

    async getTokenFromCode(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        await this.saveTokens(tokens);
        return tokens;
    }
}
