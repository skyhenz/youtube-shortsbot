import gtts from 'gtts';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/config.js';

export default async function generateVoice(scriptData) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const outputFile = path.join(config.paths.output, `audio_${timestamp}.mp3`);

    return new Promise((resolve, reject) => {
        const speech = new gtts(scriptData.narration, config.tts.language);

        speech.save(outputFile, (err) => {
            if (err) {
                reject(new Error(`TTS generation failed: ${err.message}`));
            } else {
                resolve(outputFile);
            }
        });
    });
}
