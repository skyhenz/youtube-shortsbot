import generateScript from './generate_script.js';
import uploadYoutube from './upload_youtube.js';
import path from 'path';
import fs from 'fs/promises';

async function manualUpload() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('📖 Usage: node scripts/manual_upload.js <video_file> <content_package>');
        console.log('Example: node scripts/manual_upload.js output/video.mp4 paket_konten/paket_konten_001.md');
        return;
    }

    const videoFile = path.resolve(args[0]);
    const contentPackage = path.resolve(args[1]);

    console.log(`🚀 Starting manual upload for: ${path.basename(videoFile)}`);

    try {
        // 1. Double check video exists
        try {
            await fs.access(videoFile);
        } catch (e) {
            console.error(`❌ Video file not found: ${videoFile}`);
            return;
        }

        // 2. Generate Script Data for metadata
        const scriptData = await generateScript(contentPackage);
        console.log('✅ Metadata prepared');

        // 3. Upload to YouTube
        console.log('📤 Uploading to YouTube...');
        const videoId = await uploadYoutube(videoFile, scriptData);
        console.log(`🎉 SUCCESS! Video uploaded. ID: ${videoId}`);
        console.log(`🔗 Watch at: https://youtu.be/${videoId}`);

    } catch (error) {
        console.error('❌ Upload Failed!');
        console.error('Error:', error.message);
    }
}

manualUpload();
