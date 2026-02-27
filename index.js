import fs from 'fs/promises';
import path from 'path';
import config from './config/config.js';
import generateScript from './scripts/generate_script.js';
import generateContent from './scripts/content_generator.js';
import generateVoice from './scripts/generate_voice.js';
import generateVideo from './scripts/generate_video.js';
import uploadYoutube from './scripts/upload_youtube.js';
import cleanup from './scripts/cleanup.js';
import {
    validateContent,
    logError,
    checkRateLimit,
    checkQuota,
    updateQuota,
    logHealthCheck
} from './scripts/validation.js';
import generateAnalytics from './scripts/analytics.js';

async function updateBotStatus(status, details = {}) {
    const statusFile = path.join(config.paths.logs, 'bot_status.json');
    const statusData = {
        status,
        timestamp: new Date().toISOString(),
        ...details
    };
    await fs.writeFile(statusFile, JSON.stringify(statusData, null, 2), 'utf-8').catch(() => { });
}

async function ensureDirectories() {
    const dirs = [config.paths.output, config.paths.logs, config.paths.assets, config.paths.content];
    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function getNextContentPackage() {
    const contentDir = config.paths.content;
    const files = await fs.readdir(contentDir);
    const packageFiles = files.filter(f => f.startsWith('paket_konten_') && f.endsWith('.md'));

    if (packageFiles.length === 0) {
        return null;
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

async function isAlreadyUploaded(topic) {
    const logsDir = config.paths.logs;
    const files = await fs.readdir(logsDir);
    const logFiles = files.filter(f => f.startsWith('upload_log_') && f.endsWith('.json'));

    for (const file of logFiles) {
        try {
            const logData = await fs.readFile(path.join(logsDir, file), 'utf-8');
            const uploads = JSON.parse(logData);
            if (uploads.some(u => u.title.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(u.title.toLowerCase()))) {
                return true;
            }
        } catch (err) {
            console.error(`Error reading log file ${file}:`, err.message);
        }
    }
    return false;
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
    console.log('🤖 YouTube Shorts Bot Started');
    await updateBotStatus('RUNNING');

    // Support one-off processing of a specific file
    const specificFile = process.argv[2];
    if (specificFile) {
        console.log(`🎯 Targeted processing: ${specificFile}`);
    }

    while (true) {
        try {
            console.log('\n--- SIKLUS BARU ---');
            if (process.env.SINGLE_RUN === 'true') {
                console.log('🚀 Single Run Mode detected (GitHub Actions).');
            } else {
                console.log('⏰', new Date().toLocaleString('id-ID'));
            }

            await ensureDirectories();

            let contentPackage = specificFile ? path.resolve(specificFile) : await getNextContentPackage();

            if (!contentPackage) {
                console.log('ℹ️ Tidak ada paket konten, mencoba generate baru...');
                await generateContent();
                contentPackage = await getNextContentPackage();
            }

            if (!contentPackage) {
                console.log('ℹ️ Tidak ada paket konten tersedia.');
            } else {
                console.log('📦 Processing:', path.basename(contentPackage));

                const scriptData = await generateScript(contentPackage);
                console.log('✅ Script generated');

                // Check for duplicate topic before proceeding further
                if (await isAlreadyUploaded(scriptData.topic)) {
                    console.log(`ℹ️ Topic '${scriptData.topic}' has already been uploaded. Skipping.`);
                    await markAsProcessed(contentPackage);
                    if (specificFile) {
                        console.log('✅ Specific file already processed. Exiting.');
                        await updateBotStatus('IDLE');
                        process.exit(0);
                    }
                    continue;
                }

                const audioFile = await generateVoice(scriptData);
                console.log('✅ Voice generated');

                const videoFile = await generateVideo(scriptData, audioFile);
                console.log('✅ Video generated');

                await logHealthCheck('video_created');

                const validation = await validateContent(videoFile, audioFile);
                if (!validation.valid) {
                    console.error('❌ Content validation failed:');
                    validation.errors.forEach(err => console.error('  -', err));
                    await logError(contentPackage, validation.errors);
                    await logHealthCheck('upload_failed', { error: 'Content validation failed' });
                    await markAsProcessed(contentPackage);
                } else {
                    console.log('✅ Content validated');

                    if (config.testMode) {
                        console.log('🧪 TEST MODE: Skipping upload');
                        await markAsProcessed(contentPackage);
                    } else if (config.upload.autoUpload) {
                        const rateLimit = await checkRateLimit();
                        const quota = await checkQuota();

                        if (!rateLimit.allowed || !quota.allowed) {
                            console.warn('⚠️ Limits reached, video saved locally.');
                            await logHealthCheck('upload_failed', { error: 'Limits reached' });
                        } else {
                            try {
                                console.log('🚀 Uploading to YouTube...');
                                const videoId = await uploadYoutube(videoFile, scriptData);
                                console.log(`✅ Uploaded successfully! Video ID: ${videoId}`);

                                await logUpload(videoId, scriptData.topic, path.basename(videoFile));
                                await updateQuota(1);
                                await logHealthCheck('upload_success');
                                await markAsProcessed(contentPackage);
                                await cleanup(audioFile, videoFile);
                                console.log('✅ Cleanup completed');
                            } catch (uploadError) {
                                console.error(`⚠️ Upload failed: ${uploadError.message}`);
                                const failLog = path.join(config.paths.logs, 'upload_failed.log');
                                const failEntry = `${new Date().toISOString()} | ${videoFile} | ${uploadError.message}\n`;
                                await fs.appendFile(failLog, failEntry, 'utf-8').catch(() => { });

                                await logError(contentPackage, [uploadError.message]);
                                await logHealthCheck('upload_failed', { error: uploadError.message });
                                await markAsProcessed(contentPackage);
                            }
                        }
                    }
                }
            }

            console.log('🎉 Cicilan bot selesai');
            await generateAnalytics();

            if (specificFile) {
                console.log('✅ Specific file processing complete. Exiting.');
                await updateBotStatus('IDLE');
                process.exit(0);
            }

        } catch (error) {
            console.error('❌ Loop Error:', error.message);
            await updateBotStatus('ERROR', { error: error.message });
        }

        if (config.testMode) {
            console.log('🧪 Test mode complete, exiting.');
            await updateBotStatus('IDLE');
            break;
        }

        // Exit immediately if running in GitHub Actions (single run mode)
        if (process.env.SINGLE_RUN === 'true') {
            console.log('✅ Single run complete. Exiting.');
            process.exit(0);
        }

        const intervalHours = config.upload.intervalHours;
        console.log(`\n😴 Menunggu ${intervalHours} jam untuk siklus berikutnya...`);
        await updateBotStatus('SLEEPING', { next_run: new Date(Date.now() + intervalHours * 60 * 60 * 1000).toISOString() });
        await new Promise(resolve => setTimeout(resolve, intervalHours * 60 * 60 * 1000));

        await updateBotStatus('RUNNING');
    }
}

main();
