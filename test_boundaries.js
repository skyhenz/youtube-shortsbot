import { MsEdgeTTS } from 'msedge-tts';
import fs from 'fs/promises';

async function testWordBoundaries() {
    const tts = new MsEdgeTTS();
    await tts.setMetadata('id-ID-ArdiNeural', 'audio-24khz-48kbitrate-mono-mp3');

    console.log('Testing word boundaries...');

    // In some versions of msedge-tts, it doesn't support word boundaries directly.
    // Let's check the library source or try common event listeners.

    try {
        const stream = tts.toStream('Halo dunia');
        // Check if stream has events
        console.log('Stream experimental check...');
    } catch (e) {
        console.log('Stream not supported');
    }

    // Alternative: use a library that does support it if this one doesn't.
    // But let's try to make it work.
}

testWordBoundaries();
