import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/config.js';

async function createBackgroundImage(scriptData) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const bgFile = path.join(config.paths.output, `bg_${timestamp}.png`);

    const { bgColor1, bgColor2 } = scriptData.visualSettings;

    const svgContent = `
    <svg width="${config.video.width}" height="${config.video.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${config.video.width}" height="${config.video.height}" fill="url(#grad)" />
    </svg>
  `;

    await fs.writeFile(bgFile, svgContent);
    return bgFile;
}

async function createTextOverlay(scriptData) {
    const timestamp = new Date().toISOString().replace(//-:]/g, '').replace(/\..+/, '').replace('T', '_');
  const overlayFile = path.join(config.paths.output, `overlay_${timestamp}.txt`);

    const texts = scriptData.screenTexts;
    const duration = 35;
    const timePerText = duration / texts.length;

    let filterComplex = [];

    for (let i = 0; i < texts.length; i++) {
        const startTime = i * timePerText;
        const endTime = (i + 1) * timePerText;
        const text = texts[i].replace(/'/g, "\\'");

        const isAccent = text.startsWith('#');
        const fontSize = isAccent ? scriptData.visualSettings.fontSizeAccent : scriptData.visualSettings.fontSize;
        const color = isAccent ? scriptData.visualSettings.accentColor : scriptData.visualSettings.textColor;

        filterComplex.push(
            `drawtext=text='${text}':fontfile=/Windows/Fonts/arialbd.ttf:fontsize=${fontSize}:fontcolor=${color}:` +
            `borderw=4:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)/2:` +
            `enable='between(t,${startTime},${endTime})'`
        );
    }

    await fs.writeFile(overlayFile, filterComplex.join(','), 'utf-8');
    return filterComplex.join(',');
}

export default async function generateVideo(scriptData, audioFile) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
    const topicSlug = scriptData.topic.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const outputFile = path.join(config.paths.output, `${timestamp}_${topicSlug}.mp4`);

    const bgFile = await createBackgroundImage(scriptData);
    const textFilter = await createTextOverlay(scriptData);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(bgFile)
            .inputOptions(['-loop 1'])
            .input(audioFile)
            .outputOptions([
                `-vf ${textFilter}`,
                `-c:v libx264`,
                `-t 40`,
                `-pix_fmt yuv420p`,
                `-r ${config.video.fps}`,
                `-b:v ${config.video.bitrate}`,
                `-c:a aac`,
                `-b:a 192k`,
                `-shortest`
            ])
            .size(`${config.video.width}x${config.video.height}`)
            .output(outputFile)
            .on('end', async () => {
                await fs.unlink(bgFile).catch(() => { });
                resolve(outputFile);
            })
            .on('error', (err) => {
                reject(new Error(`Video generation failed: ${err.message}`));
            })
            .run();
    });
}
