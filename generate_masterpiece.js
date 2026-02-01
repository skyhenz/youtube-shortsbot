import generateScript from './scripts/generate_script.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';
import fs from 'fs/promises';
import path from 'path';

async function generateMasterpiece() {
    console.log('💎 Starting Masterpiece YouTube Short Production...');

    // 1. Path to the premium content package
    const contentPackage = './paket_konten/paket_konten_premium_009.md';

    try {
        console.log(`📦 Loading Content: ${contentPackage}`);

        // 2. Generate Script
        const scriptData = await generateScript(contentPackage);
        console.log('✅ Script data generated');

        // 3. Generate Voice (Neural)
        const audioFile = await generateVoice(scriptData);
        console.log(`✅ Neural Voice generated: ${audioFile}`);

        // 4. Generate Video (Premium with 3D Visuals and Cinematic Camera)
        console.log('🎬 Rendering Masterpiece Video...');
        const videoFile = await generateVideo(scriptData, audioFile);

        console.log('\n✨ MASTERPIECE PRODUCED SUCCESSFULLY! ✨');
        console.log(`📂 Location: ${videoFile}`);
        console.log(`🎞️  Topic: ${scriptData.topic}`);

    } catch (error) {
        console.error('\n❌ MASTERPIECE PRODUCTION FAILED!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

generateMasterpiece();
