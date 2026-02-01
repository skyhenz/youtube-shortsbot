import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import config from '../config/config.js';

export async function fetchRelevantImage(keyword, index) {
    const tempDir = path.join(config.paths.assets, 'temp_bg');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = path.join(tempDir, `bg_${index}_${sanitizedKeyword}.jpg`);

    const styleSuffix = " cinematic digital illustration professional high contrast sharp focus unreal engine 5 4k";
    const searchQuery = keyword + styleSuffix;

    const fetchImageStream = async (url, headers = {}) => {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 8000,
            headers: {
                ...headers,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    };

    // 1. Try Pexels API (Ultra Premium)
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey && pexelsKey !== 'your_pexels_key' && pexelsKey.length > 10) {
        try {
            const randomPage = Math.floor(Math.random() * 5) + 1;
            console.log(`📸 Fetching premium image from Pexels (Page ${randomPage}) for: "${keyword}"`);
            const response = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=15&page=${randomPage}`, {
                headers: { Authorization: pexelsKey }
            });

            if (response.data.photos && response.data.photos.length > 0) {
                const randomIndex = Math.floor(Math.random() * response.data.photos.length);
                const imageUrl = response.data.photos[randomIndex].src.large2x;
                return await fetchImageStream(imageUrl);
            }
        } catch (err) {
            console.warn(`⚠️ Pexels failed: ${err.message}. Falling back...`);
        }
    }

    // 2. Fallback to LoremFlickr
    const primaryUrl = `https://loremflickr.com/1080/1920/${encodeURIComponent(searchQuery)}/all`;
    const fallbackUrl = `https://picsum.photos/1080/1920?random=${index}`;

    console.log(`📸 Fetching image (Fallback) for segment ${index} ("${keyword}")...`);

    try {
        return await fetchImageStream(primaryUrl);
    } catch (error) {
        console.warn(`⚠️ LoremFlickr failed for "${keyword}", using Picsum fallback.`);
        try {
            return await fetchImageStream(fallbackUrl);
        } catch (fError) {
            console.error(`❌ Fallback also failed: ${fError.message}`);
            return null;
        }
    }
}

/**
 * Fetch a relevant video clip from Pexels
 */
export async function fetchRelevantVideo(keyword, index) {
    const tempDir = path.join(config.paths.assets, 'temp_bg');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = path.join(tempDir, `vid_${index}_${sanitizedKeyword}.mp4`);

    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey && pexelsKey !== 'your_pexels_key' && pexelsKey.length > 10) {
        try {
            const randomPage = Math.floor(Math.random() * 3) + 1;
            console.log(`🎬 Fetching premium video from Pexels (Page ${randomPage}) for: "${keyword}"`);
            // Search for vertical (portrait) videos
            const response = await axios.get(`https://api.pexels.com/videos/search?query=${encodeURIComponent(keyword)}&per_page=10&orientation=portrait&page=${randomPage}`, {
                headers: { Authorization: pexelsKey }
            });

            if (response.data.videos && response.data.videos.length > 0) {
                // Pick a random video from results
                const randomIndex = Math.floor(Math.random() * response.data.videos.length);
                const video = response.data.videos[randomIndex];

                // Find a good quality MP4 video file
                const videoFile = video.video_files.find(f => f.file_type === 'video/mp4' && f.width >= 720) || video.video_files[0];

                const imageUrl = videoFile.link;
                const responseStream = await axios({
                    url: imageUrl,
                    method: 'GET',
                    responseType: 'stream',
                    timeout: 15000
                });

                const writer = fs.createWriteStream(filePath);
                responseStream.data.pipe(writer);

                return new Promise((resolve, reject) => {
                    writer.on('finish', () => resolve(filePath));
                    writer.on('error', reject);
                });
            }
        } catch (err) {
            console.warn(`⚠️ Pexels Video failed: ${err.message}.`);
        }
    }

    return null; // Fallback to image if video fetch fails
}

export async function cleanupTempImages() {
    const tempDir = path.join(config.paths.assets, 'temp_bg');
    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            try {
                fs.unlinkSync(path.join(tempDir, file));
            } catch (e) { }
        }
    }
}
