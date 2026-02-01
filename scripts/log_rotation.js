import fs from 'fs/promises';
import path from 'path';

/**
 * Log the selected CTA and description variant for a generated video.
 * @param {string} videoId - Identifier for the video (e.g., filename or UUID).
 * @param {string} cta - The CTA string that was used.
 * @param {number} descriptionId - Index of the description variant selected.
 */
export async function logSelection(videoId, cta, descriptionId, affiliateId) {
    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, 'rotation.log');

    const date = new Date().toISOString().split('T')[0];
    const packageFile = path.basename(videoId);
    const entry = `${date} | ${packageFile} | ${cta} | ${affiliateId}`;

    await fs.appendFile(logFile, entry + '\n', 'utf-8');
}
