import generateContent from './scripts/content_generator.js';
import generateScript from './scripts/generate_script.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';

async function testViralGrowth() {
    console.log('🚀 Starting Viral Growth Pipeline Test...');

    try {
        // 1. Generate Loop-Ready Content
        console.log('📝 Generating viral content...');
        const contentPath = await generateContent();
        console.log(`✅ Content generated: ${contentPath}`);

        // 2. Generate Loop-Friendly Script
        const scriptData = await generateScript(contentPath);
        console.log('✅ Script engine processed loop logic');
        console.log('--- NARRATION CHECK ---');
        console.log(scriptData.narration);
        console.log('-----------------------');

        // 3. Neural Voice
        const audioFile = await generateVoice(scriptData);
        console.log(`✅ Neural voice ready: ${audioFile}`);

        // 4. Ultra-Premium Render with Hook & Magnet
        console.log('🎬 Rendering Ultra-Premium Viral Video...');
        const videoFile = await generateVideo(scriptData, audioFile);

        console.log('\n🔥 VIRAL MASTERPIECE READY!');
        console.log(`📂 Path: ${videoFile}`);

    } catch (error) {
        console.error('❌ Growth Hack test failed:', error.message);
    }
}

testViralGrowth();
