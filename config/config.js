import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export default {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    uploadPrivacy: process.env.UPLOAD_PRIVACY || 'public'
  },
  
  paths: {
    content: process.env.CONTENT_DIR || path.join(__dirname, '..', 'paket_konten'),
    output: process.env.OUTPUT_DIR || path.join(__dirname, '..', 'output'),
    assets: process.env.ASSETS_DIR || path.join(__dirname, '..', 'assets'),
    logs: process.env.LOGS_DIR || path.join(__dirname, '..', 'logs')
  },
  
  tts: {
    language: process.env.TTS_LANGUAGE || 'id',
    speed: parseFloat(process.env.TTS_SPEED) || 1.0
  },
  
  video: {
    width: parseInt(process.env.VIDEO_WIDTH) || 1080,
    height: parseInt(process.env.VIDEO_HEIGHT) || 1920,
    fps: parseInt(process.env.VIDEO_FPS) || 30,
    bitrate: process.env.VIDEO_BITRATE || '8000k'
  },
  
  upload: {
    autoUpload: process.env.AUTO_UPLOAD === 'true'
  }
};
