import generateScript from './scripts/generate_script.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';
import path from 'path';

async function runTest() {
    console.log('💎 Starting Ultra-Premium Feature Test...');
    const contentPackage = './paket_konten/paket_konten_masterpiece_fokus.md';

    try {
        const scriptData = await generateScript(contentPackage);
        console.log('✅ Script generated');

        const audioFile = await generateVoice(scriptData);
        console.log('✅ Neural Voice with Word Boundaries generated');

        const videoFile = await generateVideo(scriptData, audioFile);
        console.log('\n✨ PRODUCTION SUCCESSFUL! ✨');
        console.log(`📂 Video Location: ${path.resolve(videoFile)}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

runTest();
