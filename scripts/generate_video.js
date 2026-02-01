import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs/promises';
import config from '../config/config.js';
import { logSelection } from './log_rotation.js';
import { fetchRelevantImage, fetchRelevantVideo, cleanupTempImages } from './image_fetcher.js';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

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

  // 1. Get exact audio duration or set default for Visual-Only
  let audioDuration = 0;
  if (scriptData.narration === 'none') {
    audioDuration = 15; // Default 15s for visual-only shorts
    console.log('🎬 Visual-Only Mode: Setting default duration to 15s');
  } else {
    audioDuration = await getAudioDuration(path.resolve(audioFile));
  }
  const TOTAL_DURATION = audioDuration;
  console.log(`⏱️  Target duration: ${TOTAL_DURATION.toFixed(2)}s`);

  // 2. Setup Background Music
  const musicDir = path.join(process.cwd(), 'assets', 'music');
  let musicFile = null;
  try {
    const musicFiles = (await fs.readdir(musicDir)).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
    if (musicFiles.length > 0) {
      musicFile = path.join(musicDir, musicFiles[Math.floor(Math.random() * musicFiles.length)]);
      console.log(`🎵 Using background music: ${path.basename(musicFile)}`);
    } else {
      console.log('ℹ️ No background music found in assets/music, skipping mix.');
    }
  } catch (err) {
    console.log('ℹ️ Music directory not found, skipping mix.');
  }

  // Prepare monetization data
  const descVariants = JSON.parse(await fs.readFile(path.join(process.cwd(), 'config', 'description_variants.json'), 'utf-8'));
  const selectedDescriptionId = Math.floor(Math.random() * descVariants.length);
  scriptData.selectedDescriptionId = selectedDescriptionId;
  scriptData.selectedDescription = descVariants[selectedDescriptionId];

  // Logic for Affiliate Selection
  const affList = JSON.parse(await fs.readFile(path.join(process.cwd(), 'config', 'affiliate_list.json'), 'utf-8'));
  const selectedAffiliate = affList[Math.floor(Math.random() * affList.length)];
  scriptData.selectedAffiliateId = selectedAffiliate.id;
  scriptData.selectedAffiliateCopy = selectedAffiliate.copy;

  // 3. Fetch relevant visuals for each text segment
  console.log('🖼️  Fetching visuals for segments...');
  const segments = scriptData.screenTexts;
  const timePerSegment = TOTAL_DURATION / segments.length;

  // Growth Hack: Limit video animations to 3-5 unique clips to maintain "Ultra-Premium" feel without clutter
  const maxVideos = Math.min(5, Math.max(3, Math.floor(segments.length / 3)));
  let videosFetched = 0;
  const videoIndices = new Set();

  // Randomly select indices for videos
  while (videoIndices.size < Math.min(maxVideos, segments.length)) {
    videoIndices.add(Math.floor(Math.random() * segments.length));
  }

  const visualAssets = []; // Array of { path, type: 'video' | 'image' | 'color' }
  for (let i = 0; i < segments.length; i++) {
    const keyword = segments[i].replace(/^#\s*/, '');
    let assetPath = null;
    let assetType = 'color';

    // Try Video only for selected indices
    if (videoIndices.has(i)) {
      console.log(`🎬 Target segment ${i} for Video Animation...`);
      const baseKeyword = scriptData.visualSettings.keywords || keyword;
      const cinematicKeyword = `cinematic ${baseKeyword} ${keyword}`;
      assetPath = await fetchRelevantVideo(cinematicKeyword, i);
      if (assetPath) {
        assetType = 'video';
        videosFetched++;
      }
    }

    // Fallback to Image if video not selected or fetch failed
    if (!assetPath) {
      assetPath = await fetchRelevantImage(keyword, i);
      assetType = assetPath ? 'image' : 'color';
    }

    visualAssets.push({ path: assetPath, type: assetType });
  }
  console.log(`✅ Visuals prepared: ${videosFetched} videos, ${visualAssets.length - videosFetched} images/colors.`);

  // 4. Build Complex Filter for FFmpeg
  let filterComplex = [];
  let inputChain = [];
  const absoluteFontPath = path.resolve('assets/font.ttf').replace(/\\/g, '/').replace(/:/g, '\\:');

  for (let i = 0; i < segments.length; i++) {
    const asset = visualAssets[i];
    const fps = 30;
    const durationFrames = Math.ceil(timePerSegment * fps);

    // Base visual processing (must stay before concat)
    if (asset.type === 'video') {
      filterComplex.push(`[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,setpts=PTS-STARTPTS[vbase${i}]`);
    } else if (asset.type === 'image') {
      const zoomType = i % 2 === 0 ? "zoom+0.0006" : "zoom-0.0006";
      filterComplex.push(`[${i}:v]scale=1080:1920,format=yuv420p,zoompan=z='${zoomType}':d=${durationFrames}:s=1080x1920:fps=${fps}:x='iw*0.01*on/${durationFrames}':y='ih*0.01*on/${durationFrames}',setsar=1[vbase${i}]`);
    } else {
      filterComplex.push(`[${i}:v]setsar=1[vbase${i}]`);
    }
    inputChain.push(`[vbase${i}]`);
  }

  // Concat segments
  filterComplex.push(`${inputChain.join('')}concat=n=${segments.length}:v=1:a=0[vconcat]`);

  let vTag = 'vconcat';

  // Masterpiece: Removed Viral Hook for professional feel

  // Growth Hack 2: Ultra-Premium Karaoke Subtitles (Using Word Boundaries)
  if (scriptData.wordBoundaries && scriptData.wordBoundaries.length > 0) {
    const assFile = path.join(config.paths.output, `subtitles_${timestamp}.ass`);
    let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,70,&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,3,2,5,50,50,960,1
Style: Karaoke,Inter,75,&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,4,0,5,50,50,960,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    const formatTime = (s) => {
      const ms = Math.floor((s % 1) * 100);
      const seconds = Math.floor(s % 60);
      const minutes = Math.floor((s / 60) % 60);
      const hours = Math.floor(s / 3600);
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    };

    // Group words into phrases (e.g. 4 words per line)
    const wordsPerPhrase = 4;
    for (let i = 0; i < scriptData.wordBoundaries.length; i += wordsPerPhrase) {
      const phraseWords = scriptData.wordBoundaries.slice(i, i + wordsPerPhrase);
      const start = phraseWords[0].start;
      const end = phraseWords[phraseWords.length - 1].start + phraseWords[phraseWords.length - 1].duration + 0.5;

      let karaokeText = "";
      phraseWords.forEach(w => {
        const dur = Math.floor(w.duration * 100);
        karaokeText += `{\\k${dur}}${w.text} `;
      });

      assContent += `Dialogue: 0,${formatTime(start)},${formatTime(end)},Karaoke,,0,0,0,,${karaokeText.trim()}\n`;
    }

    await fs.writeFile(assFile, assContent);
    const absoluteAssPath = path.resolve(assFile).replace(/\\/g, '/').replace(/:/g, '\\:');
    filterComplex.push(`[${vTag}]subtitles='${absoluteAssPath}'[vsub]`);
    vTag = 'vsub';
    console.log('📜 Karaoke Subtitles (ASS) generated and applied.');
  } else {
    // Fallback to old segment-based subtitles if no word boundaries
    for (let i = 0; i < segments.length; i++) {
      const startTime = i * timePerSegment + 0.5;
      const endTime = (i + 1) * timePerSegment - 0.2;
      const text = segments[i].replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/,/g, '\\,');
      const color = text.startsWith('#') ? `0x${scriptData.visualSettings.accentColor.slice(1)}` : '0xFFFFFF';

      filterComplex.push(`[${vTag}]drawtext=text='${text}':fontfile=${absoluteFontPath}:fontsize=70:fontcolor=${color}:x=(w-text_w)/2:y=h/2:box=1:boxcolor=black@0.5:enable='between(t,${startTime},${endTime})'[vtext${i}]`);
      vTag = `vtext${i}`;
    }
  }

  // Cinematic Masterpiece: Final CTA & Vignette
  const subText = scriptData.selectedCTA || "Subscribe for deeper psychology insights.";
  filterComplex.push(`[${vTag}]drawtext=text='${subText}':fontfile=${absoluteFontPath}:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-text_h-150:alpha='if(lt(t,${TOTAL_DURATION}-3),0,if(lt(t,${TOTAL_DURATION}-2.5),(t-(${TOTAL_DURATION}-3))/0.5,1))':box=1:boxcolor=black@0.6:boxborderw=20:enable='between(t,${TOTAL_DURATION}-3,${TOTAL_DURATION})'[vcta]`);
  filterComplex.push(`[vcta]vignette=angle=0.4:x0=w/2:y0=h/2[vfinal]`);

  // Log the final filter complex for debugging
  console.log('🧪 DEBUG: Total filter chains:', filterComplex.length);

  // 5. Audio Mixing Engine (Masterpiece Edition)
  const audioIndex = segments.length;
  const NARRATION_DELAY = 1000; // 1 second delay in ms

  if (musicFile) {
    if (scriptData.narration !== 'none') {
      // 1s Delay for Narration + Boost
      filterComplex.push(`[${audioIndex}:a]adelay=${NARRATION_DELAY}|${NARRATION_DELAY},volume=1.8[v_audio]`);
      // Atmospheric Background Music (Low volume, looped)
      filterComplex.push(`[${audioIndex + 1}:a]volume=0.08,aloop=loop=-1:size=2e9,atrim=0:${TOTAL_DURATION + 1}[m_audio]`);
      // Final Mix
      filterComplex.push(`[v_audio][m_audio]amix=inputs=2:duration=first:dropout_transition=3[afinal]`);
    } else {
      // Visual-Only: Just Music at higher volume
      filterComplex.push(`[${audioIndex + 1}:a]volume=0.5,aloop=loop=-1:size=2e9,atrim=0:${TOTAL_DURATION + 1}[afinal]`);
    }
  } else {
    if (scriptData.narration !== 'none') {
      filterComplex.push(`[${audioIndex}:a]adelay=${NARRATION_DELAY}|${NARRATION_DELAY}[afinal]`);
    } else {
      // No music and no narration: Silent (not ideal, but fallback)
      filterComplex.push(`anullsrc=r=44100:cl=stereo[afinal]`);
    }
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Inputs: Visuals (Images or Videos)
    visualAssets.forEach(asset => {
      if (asset.type === 'video') {
        command = command.input(path.resolve(asset.path))
          .inputOptions(['-stream_loop', '-1']) // Loop video to ensure it covers duration
          .inputOptions(['-t', timePerSegment.toString()]);
      } else if (asset.type === 'image') {
        command = command.input(path.resolve(asset.path))
          .inputOptions(['-loop', '1', '-t', timePerSegment.toString()]);
      } else {
        command = command.input(`color=c=black:s=1080x1920:d=${timePerSegment}`)
          .inputFormat('lavfi');
      }
    });

    // Inputs: Narration (Index: segments.length)
    command = command.input(path.resolve(audioFile));

    // Inputs: Background Music (Index: segments.length + 1)
    if (musicFile) {
      command = command.input(path.resolve(musicFile));
    }

    command
      .complexFilter(filterComplex.join(';'))
      .map('[vfinal]')
      .map('[afinal]')
      .outputOptions([
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-b:v', '7000k',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', TOTAL_DURATION.toString(),
        '-shortest'
      ])
      .output(path.resolve(outputFile))
      .on('start', (cmd) => {
        console.log('🚀 FFmpeg starting Ultra-Premium Animated Render...');
        console.log('💻 Command:', cmd);
      })
      .on('stderr', (stderr) => {
        if (stderr.toLowerCase().includes('error')) {
          console.error('FFmpeg Log:', stderr.trim());
        }
      })
      .on('end', async () => {
        await logSelection(outputFile, scriptData.selectedCTA, scriptData.selectedDescriptionId, scriptData.selectedAffiliateId);
        await cleanupTempImages();
        resolve(outputFile);
      })
      .on('error', (err) => {
        cleanupTempImages().catch(() => { });
        reject(new Error(`Ultra-Premium animated render failed: ${err.message}`));
      })
      .run();
  });
}
