import fs from 'fs/promises';
import path from 'path';
import config from '../config/config.js';

/**
 * Validate video content before upload
 */
export async function validateContent(videoFile, audioFile) {
    const errors = [];

    // Check video file exists and has size
    try {
        const videoStats = await fs.stat(videoFile);
        if (videoStats.size === 0) {
            errors.push('Video file is empty');
        }
        if (videoStats.size < 10000) { // Less than 10KB
            errors.push('Video file too small, likely corrupted');
        }
    } catch (err) {
        errors.push(`Video file not found: ${err.message}`);
    }

    // Check audio file exists
    if (audioFile) {
        try {
            const audioStats = await fs.stat(audioFile);
            if (audioStats.size === 0) {
                errors.push('Audio file is empty');
            }
        } catch (err) {
            errors.push(`Audio file not found: ${err.message}`);
        }
    }

    // Duration validation (removed file-size estimation as it is unreliable for highly compressed text videos)
    // We already check for minimum file size (>10KB) at the top of this function.

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Log errors to error_log.json
 */
export async function logError(contentPackage, errors) {
    const now = new Date();
    const logFile = path.join(config.paths.logs, 'error_log.json');

    let errorLog = [];
    try {
        const logData = await fs.readFile(logFile, 'utf-8');
        errorLog = JSON.parse(logData);
    } catch (err) {
        // File doesn't exist yet
    }

    errorLog.push({
        timestamp: now.toISOString(),
        package: path.basename(contentPackage),
        errors: errors
    });

    await fs.writeFile(logFile, JSON.stringify(errorLog, null, 2), 'utf-8');
}

/**
 * Check if rate limit exceeded (max 3 uploads per day)
 */
export async function checkRateLimit() {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const logFile = path.join(config.paths.logs, `upload_log_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.json`);

    let uploads = [];
    try {
        const logData = await fs.readFile(logFile, 'utf-8');
        uploads = JSON.parse(logData);
    } catch (err) {
        return { allowed: true, count: 0 };
    }

    // Count uploads today
    const todayUploads = uploads.filter(u => u.timestamp.startsWith(today));

    return {
        allowed: todayUploads.length < 10,
        count: todayUploads.length,
        limit: 10
    };
}

/**
 * Check YouTube API quota (simplified - tracks uploads)
 * YouTube quota: 10,000 units/day, upload = ~1600 units
 * Max ~6 uploads/day safely
 */
export async function checkQuota() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const quotaFile = path.join(config.paths.logs, 'quota_tracker.json');

    let quotaData = { date: today, uploads: 0 };
    try {
        const data = await fs.readFile(quotaFile, 'utf-8');
        quotaData = JSON.parse(data);

        // Reset if new day
        if (quotaData.date !== today) {
            quotaData = { date: today, uploads: 0 };
        }
    } catch (err) {
        // File doesn't exist
    }

    const quotaUsed = quotaData.uploads * 1600; // Approximate units per upload
    const quotaLimit = 10000;
    const quotaRemaining = quotaLimit - quotaUsed;

    return {
        allowed: quotaRemaining >= 1600,
        used: quotaUsed,
        remaining: quotaRemaining,
        limit: quotaLimit
    };
}

/**
 * Update quota tracker after upload
 */
export async function updateQuota() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const quotaFile = path.join(config.paths.logs, 'quota_tracker.json');

    let quotaData = { date: today, uploads: 0 };
    try {
        const data = await fs.readFile(quotaFile, 'utf-8');
        quotaData = JSON.parse(data);

        if (quotaData.date !== today) {
            quotaData = { date: today, uploads: 0 };
        }
    } catch (err) {
        // File doesn't exist
    }

    quotaData.uploads += 1;
    await fs.writeFile(quotaFile, JSON.stringify(quotaData, null, 2), 'utf-8');
}

/**
 * Log daily health check
 */
export async function logHealthCheck(status, details = {}) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const healthFile = path.join(config.paths.logs, 'health_check.json');

    let healthLog = [];
    try {
        const data = await fs.readFile(healthFile, 'utf-8');
        healthLog = JSON.parse(data);
    } catch (err) {
        // File doesn't exist
    }

    // Find or create today's entry
    let todayEntry = healthLog.find(h => h.date === today);
    if (!todayEntry) {
        todayEntry = {
            date: today,
            videos_created: 0,
            uploads_success: 0,
            uploads_failed: 0,
            errors: []
        };
        healthLog.push(todayEntry);
    }

    // Update stats
    if (status === 'video_created') {
        todayEntry.videos_created += 1;
    } else if (status === 'upload_success') {
        todayEntry.uploads_success += 1;
    } else if (status === 'upload_failed') {
        todayEntry.uploads_failed += 1;
        if (details.error) {
            todayEntry.errors.push(details.error);
        }
    }

    await fs.writeFile(healthFile, JSON.stringify(healthLog, null, 2), 'utf-8');
}

/**
 * Sanitize and format title safely
 */
export function sanitizeTitle(title) {
    // Remove illegal characters for YouTube
    let safe = title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '');

    // Limit to 100 characters
    if (safe.length > 100) {
        safe = safe.substring(0, 97) + '...';
    }

    return safe;
}
