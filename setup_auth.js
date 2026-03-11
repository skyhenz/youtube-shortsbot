import AuthManager from './scripts/auth_manager.js';
import readline from 'readline';

const auth = new AuthManager();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function main() {
    console.log('--- YouTube Bot Auth Setup ---');
    const url = auth.generateAuthUrl();
    console.log('\n1. Buka URL ini di browser:\n', url);
    
    rl.question('\n2. Setelah login, masukkan "code" yang ada di URL redirect (setelah code=): ', async (code) => {
        try {
            const tokens = await auth.getTokenFromCode(code);
            console.log('\n✅ Sukses! Token telah disimpan di config/token.json');
            console.log('\nCopy REFRESH_TOKEN ini ke GitHub Secrets (YOUTUBE_REFRESH_TOKEN):');
            console.log('\x1b[36m%s\x1b[0m', tokens.refresh_token);
            
            if (tokens.refresh_token) {
                console.log('\n--- PENTING ---');
                console.log('Jika refresh_token sering expired dalam 7 hari, pastikan status app di Google Cloud Console sudah "PRODUCTION", bukan "TESTING".');
            }
        } catch (err) {
            console.error('\n❌ Error:', err.message);
        } finally {
            rl.close();
        }
    });
}

main();
