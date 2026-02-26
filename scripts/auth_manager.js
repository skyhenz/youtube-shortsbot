import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = path.join(process.cwd(), 'config', 'token.json');

export default class AuthManager {
    constructor() {
        // Validate critical config before proceeding
        if (!config.youtube.clientId || config.youtube.clientId === 'your_client_id') {
            throw new Error('YOUTUBE_CLIENT_ID is missing or not set in .env / GitHub Secrets.');
        }
        if (!config.youtube.clientSecret || config.youtube.clientSecret === 'your_client_secret') {
            throw new Error('YOUTUBE_CLIENT_SECRET is missing or not set in .env / GitHub Secrets.');
        }

        this.oauth2Client = new google.auth.OAuth2(
            config.youtube.clientId,
            config.youtube.clientSecret,
            config.youtube.redirectUri
        );
    }

    /**
     * Get authorized client. Tries token.json first, then falls back to
     * YOUTUBE_REFRESH_TOKEN from environment (used by GitHub Actions).
     */
    async getClient() {
        // --- Strategy 1: Use saved token.json ---
        const tokenExists = await fs.access(TOKEN_PATH).then(() => true).catch(() => false);

        if (tokenExists) {
            try {
                const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
                const tokens = JSON.parse(tokenData);

                if (!tokens.refresh_token && !tokens.access_token) {
                    console.warn('⚠️ token.json exists but contains no valid token. Trying env fallback...');
                } else {
                    this.oauth2Client.setCredentials(tokens);

                    // Auto-refresh if expired or access_token missing
                    if (!tokens.access_token || this.oauth2Client.isTokenExpiring()) {
                        console.log('🔄 Access token expired, refreshing...');
                        const { credentials } = await this.oauth2Client.refreshAccessToken();
                        await this.saveTokens(credentials);
                        console.log('✅ Token refreshed and saved.');
                    }
                    return this.oauth2Client;
                }
            } catch (err) {
                console.warn(`⚠️ Could not use token.json: ${err.message}. Trying env fallback...`);
            }
        }

        // --- Strategy 2: Use YOUTUBE_REFRESH_TOKEN from env (GitHub Actions) ---
        const envRefreshToken = config.youtube.refreshToken;
        if (envRefreshToken && envRefreshToken !== 'your_refresh_token' && envRefreshToken.trim() !== '') {
            console.log('ℹ️ Using YOUTUBE_REFRESH_TOKEN from environment...');
            this.oauth2Client.setCredentials({
                refresh_token: envRefreshToken.trim()
            });

            try {
                const { credentials } = await this.oauth2Client.refreshAccessToken();
                // Save refreshed credentials for potential reuse within the same run
                await this.saveTokens({ ...credentials, refresh_token: envRefreshToken.trim() });
                console.log('✅ Auth via env refresh token successful.');
                return this.oauth2Client;
            } catch (refreshErr) {
                const msg = refreshErr.message || '';
                if (msg.includes('invalid_grant')) {
                    throw new Error(
                        'Authentication failed: invalid_grant. ' +
                        'Your YOUTUBE_REFRESH_TOKEN has expired or been revoked. ' +
                        'Steps to fix:\n' +
                        '  1. Run "node setup_auth.js" locally\n' +
                        '  2. Get the new refresh_token from config/token.json\n' +
                        '  3. Update YOUTUBE_REFRESH_TOKEN in GitHub Secrets\n' +
                        '  4. Make sure your Google app is in "Production" mode (not Testing)'
                    );
                }
                throw new Error(`Authentication failed: ${refreshErr.message}`);
            }
        }

        // --- Strategy 3: Nothing works ---
        throw new Error(
            'No valid YouTube credentials found.\n' +
            'For GitHub Actions: set YOUTUBE_REFRESH_TOKEN in repository Secrets.\n' +
            'For local: run "node setup_auth.js" to generate config/token.json.'
        );
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
