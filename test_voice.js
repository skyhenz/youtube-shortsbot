import { MsEdgeTTS } from 'msedge-tts';
import fs from 'fs/promises';

async function testVoice() {
    try {
        console.log('Testing MsEdgeTTS...');
        const tts = new MsEdgeTTS();
        await tts.setMetadata('id-ID-ArdiNeural', 'audio-24khz-48kbitrate-mono-mp3');
        await tts.toFile('test_voice.mp3', 'Halo, ini adalah tes suara robot yang terdengar seperti manusia.');
        console.log('Success! Saved to test_voice.mp3');
    } catch (e) {
        console.error('Failed:', e);
    }
}

testVoice();
