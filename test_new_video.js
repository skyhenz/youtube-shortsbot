import generateScript from './scripts/generate_script.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';
import fs from 'fs/promises';
import path from 'path';

async function test() {
    console.log('🧪 Starting Video Improvement Test...');

    // 1. Pick an existing content package
    const contentDir = './paket_konten';
    const files = await fs.readdir(contentDir);
    const contentPackage = path.join(contentDir, files.find(f => f.endsWith('.md')));

    if (!contentPackage) {
        console.error('❌ No content package found for testing.');
        return;
    }

    console.log(`📦 Testing with: ${contentPackage}`);

    try {
        // 2. Generate Script
        const scriptData = await generateScript(contentPackage);
        console.log('✅ Script data generated');

        // 3. Generate Voice
        const audioFile = await generateVoice(scriptData);
        console.log(`✅ Voice generated: ${audioFile}`);

        // 4. Generate Video (This is what we want to test)
        console.log('🎬 Generating Video...');
        const videoFile = await generateVideo(scriptData, audioFile);
        console.log(`🚀 SUCCESS! Video generated at: ${videoFile}`);

    } catch (error) {
        console.error('❌ Test Failed!');
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
    }
}

test();
