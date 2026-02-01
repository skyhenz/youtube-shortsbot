import { MsEdgeTTS } from 'msedge-tts';
import path from 'path';
import fs from 'fs/promises';

async function testDebug() {
    const tts = new MsEdgeTTS({ enableLogger: true });

    try {
        console.log('1. Setting metadata...');
        await tts.setMetadata('id-ID-ArdiNeural', 'audio-24khz-48kbitrate-mono-mp3', {
            wordBoundaryEnabled: true
        });

        console.log('2. Starting toFile (passing current directory)...');
        // Passing directory as first arg now
        const result = await tts.toFile('./', 'Halo, ini adalah tes suara untuk debugging v2.');
        console.log('3. Success!', result);

    } catch (e) {
        console.error('FATAL ERROR:', e);
        if (e && e.stack) console.error(e.stack);
    } finally {
        tts.close();
    }
}

testDebug();
