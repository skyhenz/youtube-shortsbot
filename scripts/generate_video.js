import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/config.js';
import { logSelection } from './log_rotation.js';
import { fetchRelevantImage, fetchRelevantVideo, cleanupTempImages } from './image_fetcher.js';

// FFmpeg will use the system path (pre-installed in GitHub Actions)

// Helper to get audio duration via ffprobe
async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

export default async function generateVideo(scriptData, audioFile) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_');
  const topicSlug = scriptData.topic.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const outputFile = path.join('output', `${timestamp}_${topicSlug}.mp4`);

  // 1. Durations & Basics
  const audioDuration = await getAudioDuration(path.resolve(audioFile));
  const sceneCount = scriptData.screenTexts.length;
  const timePerSegment = 2.0; // Enforce Algorithmic Pacing
  const TOTAL_DURATION = Math.min(audioDuration, sceneCount * timePerSegment);
  console.log(`⏱️ Algorithmic Target: ${TOTAL_DURATION.toFixed(2)}s | ${sceneCount} Flash-Cuts`);

  // 2. Prepare Multimedia Assets
  const visualAssets = [];
  for (let i = 0; i < sceneCount; i++) {
    const keyword = scriptData.screenTexts[i].replace(/^#\s*/, '');
    let assetPath = await fetchRelevantVideo(keyword, i);
    let assetType = assetPath ? 'video' : 'image';
    if (!assetPath) assetPath = await fetchRelevantImage(keyword, i);
    visualAssets.push({ path: assetPath, type: assetType });
  }

  // 3. Setup Music
  const musicDir = path.join(process.cwd(), 'assets', 'music');
  let musicFile = null;
  try {
    const musicFiles = (await fs.readdir(musicDir)).filter(f => f.endsWith('.mp3'));
    if (musicFiles.length > 0) musicFile = path.join(musicDir, musicFiles[Math.floor(Math.random() * musicFiles.length)]);
  } catch (err) { }

  // 4. Complex Filter Construction (The Manipulation Engine)
  let filterComplex = [];

  // 4.1 Visual Flash-Cuts & Zoom Logic
  visualAssets.forEach((asset, i) => {
    const tag = `vbase${i}`;
    const isProof = i === 2 || i === 3; // Proof Frame at 4-6s
    const zAmount = isProof ? 0.0015 : 0.0008;

    if (asset.type === 'video') {
      filterComplex.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='zoom+0.0005':d=60:s=1080x1920,setsar=1,setpts=PTS-STARTPTS[${tag}]`);
    } else if (asset.type === 'image') {
      filterComplex.push(`[${i}:v]scale=1920:3412,format=yuv420p,zoompan=z='zoom+${zAmount}':d=60:s=1080x1920:fps=30:x='iw*0.1*on/60':y='ih*0.1*on/60',setsar=1[${tag}]`);
    } else {
      filterComplex.push(`[${i}:v]setsar=1[${tag}]`);
    }
  });

  const concatInputs = visualAssets.map((_, i) => `[vbase${i}]`).join('');
  filterComplex.push(`${concatInputs}concat=n=${sceneCount}:v=1:a=0[vconcat]`);
  let vTag = 'vconcat';

  // 4.2 Subtitle Engineering (3 Words, UPPERCASE)
  const formatTime = (s) => {
    const ms = Math.floor((s % 1) * 100);
    const seconds = Math.floor(s % 60);
    const minutes = Math.floor((s / 60) % 60);
    const hours = Math.floor(s / 3600);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  if (scriptData.wordBoundaries && scriptData.wordBoundaries.length > 0) {
    // Professional Authority Style: White with Steel Blue highlight
    let assContent = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Inter,110,&H00FFFFFF,&H00E67E22,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,3,0,5,50,50,960,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    for (let i = 0; i < scriptData.wordBoundaries.length; i += 3) {
      const phraseWords = scriptData.wordBoundaries.slice(i, i + 3);
      const start = phraseWords[0].start;
      const end = phraseWords[phraseWords.length - 1].start + phraseWords[phraseWords.length - 1].duration + 0.3;
      let text = phraseWords.map(w => `{\\k${Math.floor(w.duration * 100)}}${w.text.toUpperCase()}`).join(' ');
      assContent += `Dialogue: 0,${formatTime(start)},${formatTime(end)},Default,,0,0,0,,${text}\n`;
    }
    const assFile = path.join(config.paths.output, `subtitles_${timestamp}.ass`);
    await fs.writeFile(assFile, assContent);
    filterComplex.push(`[${vTag}]subtitles='${path.resolve(assFile).replace(/\\/g, '/').replace(/:/g, '\\:')}'[vsub]`);
    vTag = 'vsub';
  }

  filterComplex.push(`[${vTag}]vignette=angle=0.4:x0=w/2:y0=h/2[vfinal]`);

  // 4.3 Audio Engineering
  const audioIndex = sceneCount;
  if (musicFile) {
    filterComplex.push(`[${audioIndex}:a]adelay=800|800,volume=1.9[v_audio]`);
    filterComplex.push(`[${audioIndex + 1}:a]volume=0.06,aloop=loop=-1:size=2e9,atrim=0:${TOTAL_DURATION + 1}[m_audio]`);
    filterComplex.push(`[v_audio][m_audio]amix=inputs=2:duration=first:dropout_transition=2[afinal]`);
  } else {
    filterComplex.push(`[${audioIndex}:a]adelay=800:all=1,volume=1.5[afinal]`);
  }

  // 5. Render Command
  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    visualAssets.forEach(asset => {
      command = command.input(path.resolve(asset.path)).inputOptions(['-loop', '1', '-t', '2.0']);
    });
    command = command.input(path.resolve(audioFile));
    if (musicFile) command = command.input(path.resolve(musicFile));

    command.complexFilter(filterComplex.join(';'))
      .map('[vfinal]').map('[afinal]')
      .outputOptions(['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-b:v', '6000k', '-c:a', 'aac', '-t', TOTAL_DURATION.toString(), '-shortest'])
      .output(path.resolve(outputFile))
      .on('end', async () => {
        await logSelection(outputFile, scriptData.selectedCTA, scriptData.selectedDescriptionId, scriptData.selectedAffiliateId);
        await cleanupTempImages();
        resolve(outputFile);
      })
      .on('error', (err) => {
        cleanupTempImages().catch(() => { });
        reject(err);
      })
      .run();
  });
}
