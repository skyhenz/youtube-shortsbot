import AuthManager from '../scripts/auth_manager.js';
import fs from 'fs/promises';
import path from 'path';

jest.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: jest.fn().mockImplementation(() => ({
                setCredentials: jest.fn(),
                isTokenExpiring: jest.fn().mockReturnValue(false),
                generateAuthUrl: jest.fn().mockReturnValue('http://auth-url'),
                getToken: jest.fn().mockResolvedValue({ tokens: { access_token: 'mock-access' } }),
                refreshAccessToken: jest.fn().mockResolvedValue({ credentials: { access_token: 'refreshed-access' } })
            }))
        },
        youtube: jest.fn()
    }
}));

describe('AuthManager', () => {
    const TOKEN_PATH = path.join(process.cwd(), 'config', 'token.json');

    beforeEach(async () => {
        await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
        await fs.writeFile(TOKEN_PATH, JSON.stringify({ access_token: 'old-access' }));
    });

    afterEach(async () => {
        await fs.unlink(TOKEN_PATH).catch(() => { });
    });

    test('should load existing tokens if available', async () => {
        const auth = new AuthManager();
        const client = await auth.getClient();
        expect(client.setCredentials).toHaveBeenCalledWith({ access_token: 'old-access' });
    });

    test('should generate auth URL', () => {
        const auth = new AuthManager();
        const url = auth.generateAuthUrl();
        expect(url).toBe('http://auth-url');
    });
});
