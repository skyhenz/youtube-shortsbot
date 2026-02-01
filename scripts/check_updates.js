import fs from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

async function checkUpdates() {
    console.log('🔍 Checking YouTube Upload Status...\n');

    try {
        const logsDir = config.paths.logs;
        const now = new Date();
        const currentLogFile = path.join(logsDir, `upload_log_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.json`);
        
        // 1. Get Bot Status
        try {
            const statusFile = path.join(logsDir, 'bot_status.json');
            const statusData = JSON.parse(await fs.readFile(statusFile, 'utf-8'));
            console.log(`🤖 Bot Status: ${statusData.status}`);
            console.log(`🕒 Last Activity: ${new Date(statusData.timestamp).toLocaleString('id-ID')}`);
            if (statusData.next_run) {
                console.log(`⏳ Next Scheduled Run: ${new Date(statusData.next_run).toLocaleString('id-ID')}`);
            }
            console.log('-----------------------------------');
        } catch (err) {
            console.log('ℹ️ Could not read bot_status.json');
        }

        // 2. Read Last Upload
        const files = await fs.readdir(logsDir);
        const logFiles = files.filter(f => f.startsWith('upload_log_') && f.endsWith('.json')).sort().reverse();

        if (logFiles.length === 0) {
            console.log('❌ No upload logs found.');
            return;
        }

        const latestLog = path.join(logsDir, logFiles[0]);
        const uploadData = JSON.parse(await fs.readFile(latestLog, 'utf-8'));

        if (uploadData.length === 0) {
            console.log('ℹ️ No uploads recorded in the latest log file.');
        } else {
            const lastVideo = uploadData[uploadData.length - 1];
            const lastUploadDate = new Date(lastVideo.timestamp);
            const timeDiff = Math.floor((new Date() - lastUploadDate) / (1000 * 60)); // in minutes

            console.log('📝 LATEST UPLOAD:');
            console.log(`📌 Title: ${lastVideo.title}`);
            console.log(`🎥 Video ID: ${lastVideo.video_id}`);
            console.log(`📅 Date: ${lastUploadDate.toLocaleString('id-ID')}`);
            console.log(`⏱️  Time Ago: ${timeDiff} minutes ago`);
            console.log(`🔗 URL: https://youtu.be/${lastVideo.video_id}`);
            
            console.log('\n📊 MONTHLY STATS:');
            console.log(`📈 Total Uploads this month: ${uploadData.length} videos`);
        }

    } catch (error) {
        console.error('❌ Error checking status:', error.message);
    }
}

checkUpdates();
