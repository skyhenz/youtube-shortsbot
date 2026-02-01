import { MsEdgeTTS } from 'msedge-tts';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/config.js';

export default async function generateVoice(scriptData) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const outputDir = config.paths.output;
    const outputFileName = `audio_${timestamp}`;

    console.log('🗣️  Generating Neural voice (MS Edge TTS)...');
    if (scriptData.narration === 'none') {
        console.log('ℹ️ Narration is "none", skipping voice generation.');
        return null;
    }

    const tts = new MsEdgeTTS();

    // Choose voice based on config or default to Ardi (Male) or Gadis (Female)
    // For Psychology/Sains, Ardi usually sounds better/serious
    const voiceName = 'id-ID-ArdiNeural';

    try {
        await tts.setMetadata(voiceName, 'audio-24khz-48kbitrate-mono-mp3', {
            wordBoundaryEnabled: true
        });

        // Current dir as base, library generates audio.mp3 and metadata.json
        const { audioFilePath, metadataFilePath } = await tts.toFile(outputDir, scriptData.narration, {
            rate: config.tts.speed ? (config.tts.speed >= 1 ? `+${Math.round((config.tts.speed - 1) * 100)}%` : `-${Math.round((1 - config.tts.speed) * 100)}%`) : '0%',
            pitch: '+0Hz'
        });

        // Rename to our unique timestamped name
        const finalAudioPath = path.join(outputDir, `${outputFileName}.mp3`);
        await fs.rename(audioFilePath, finalAudioPath);

        console.log(`✅ Voice generated: ${finalAudioPath}`);

        if (metadataFilePath) {
            const metadataStr = await fs.readFile(metadataFilePath, 'utf-8');
            const boundaries = [];

            // New version might return a JSON array or line-delimited
            // Let's try parsing as a whole or splitting by line
            try {
                const data = JSON.parse(metadataStr);
                const metadata = Array.isArray(data) ? data : data.Metadata;
                if (metadata) {
                    metadata.forEach(entry => {
                        if (entry.Type === 'WordBoundary') {
                            boundaries.push({
                                text: entry.Data.text.Text || entry.Data.text,
                                start: entry.Data.Offset / 10000000,
                                duration: entry.Data.Duration / 10000000
                            });
                        }
                    });
                }
            } catch (pErr) {
                // Fallback to line-delimited
                metadataStr.trim().split('\n').forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        const items = entry.Metadata || [entry];
                        items.forEach(item => {
                            if (item.Type === 'WordBoundary') {
                                boundaries.push({
                                    text: item.Data.text.Text || item.Data.text,
                                    start: item.Data.Offset / 10000000,
                                    duration: item.Data.Duration / 10000000
                                });
                            }
                        });
                    } catch (e) { }
                });
            }

            scriptData.wordBoundaries = boundaries;
            console.log(`📝 Captured ${boundaries.length} word boundaries for Karaoke.`);

            // Cleanup metadata file
            await fs.unlink(metadataFilePath).catch(() => { });
        }

        return finalAudioPath;
    } catch (error) {
        throw new Error(`MS Edge TTS generation failed: ${error.message}`);
    } finally {
        tts.close();
    }
}
