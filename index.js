import fs from 'fs/promises';
import path from 'path';
import config from './config/config.js';
import generateScript from './scripts/generate_script.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';
import uploadYoutube from './scripts/upload_youtube.js';
import cleanup from './scripts/cleanup.js';

async function ensureDirectories() {
    const dirs = [config.paths.output, config.paths.logs, config.paths.assets];
    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function getNextContentPackage() {
    const contentDir = config.paths.content;
    const files = await fs.readdir(contentDir);
    const packageFiles = files.filter(f => f.startsWith('paket_konten_') && f.endsWith('.md'));

    if (packageFiles.length === 0) {
        throw new Error('No content packages found');
    }

    packageFiles.sort();
    const logFile = path.join(config.paths.logs, 'processed.json');

    let processed = [];
    try {
        const logData = await fs.readFile(logFile, 'utf-8');
        processed = JSON.parse(logData);
    } catch (err) {
        // File doesn't exist yet
    }

    for (const file of packageFiles) {
        if (!processed.includes(file)) {
            return path.join(contentDir, file);
        }
    }

    // All processed, reset and start over
    await fs.writeFile(logFile, JSON.stringify([]), 'utf-8');
    return path.join(contentDir, packageFiles[0]);
}

async function markAsProcessed(filename) {
    const logFile = path.join(config.paths.logs, 'processed.json');
    let processed = [];

    try {
        const logData = await fs.readFile(logFile, 'utf-8');
        processed = JSON.parse(logData);
    } catch (err) {
        // File doesn't exist yet
    }

    if (!processed.includes(path.basename(filename))) {
        processed.push(path.basename(filename));
        await fs.writeFile(logFile, JSON.stringify(processed, null, 2), 'utf-8');
    }
}

async function logUpload(videoId, title, filename) {
    const now = new Date();
    const logFile = path.join(config.paths.logs, `upload_log_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.json`);

    let uploads = [];
    try {
        const logData = await fs.readFile(logFile, 'utf-8');
        uploads = JSON.parse(logData);
    } catch (err) {
        // File doesn't exist yet
    }

    uploads.push({
        timestamp: now.toISOString(),
        status: 'success',
        video_id: videoId,
        title: title,
        filename: filename
    });

    await fs.writeFile(logFile, JSON.stringify(uploads, null, 2), 'utf-8');
}

async function main() {
    try {
        console.log('🤖 YouTube Shorts Bot Started');
        console.log('⏰', new Date().toLocaleString('id-ID'));

        await ensureDirectories();

        const contentPackage = await getNextContentPackage();
        console.log('📦 Processing:', path.basename(contentPackage));

        const scriptData = await generateScript(contentPackage);
        console.log('✅ Script generated');

        const audioFile = await generateVoice(scriptData);
        console.log('✅ Voice generated');

        const videoFile = await generateVideo(scriptData, audioFile);
        console.log('✅ Video generated');

        if (config.upload.autoUpload) {
            const videoId = await uploadYoutube(videoFile, scriptData);
            console.log('✅ Video uploaded:', videoId);

            await logUpload(videoId, scriptData.topic, path.basename(videoFile));
            await markAsProcessed(contentPackage);

            await cleanup(audioFile, videoFile);
            console.log('✅ Cleanup completed');
        } else {
            console.log('⚠️ Auto-upload disabled, video saved:', videoFile);
        }

        console.log('🎉 Bot completed successfully');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
