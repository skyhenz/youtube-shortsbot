import fs from 'fs';
import { google } from 'googleapis';
import config from '../config/config.js';
import { sanitizeTitle } from './validation.js';

import AuthManager from './auth_manager.js';

const authManager = new AuthManager();

export default async function uploadYoutube(videoFile, scriptData) {
    const auth = await authManager.getClient();
    const youtube = google.youtube({ version: 'v3', auth });

    const rawTitle = `${scriptData.topic} #Shorts`;
    const title = sanitizeTitle(rawTitle);

    // Use selected description variant or fallback
    const selectedDesc = scriptData.selectedDescription || {
        summary: scriptData.topic,
        hashtags: ['#shorts', '#facts', '#indonesia', '#viral']
    };

    // Use description from script (which might include a placeholder)
    let description = scriptData.description || selectedDesc.summary;
    const hashtags = selectedDesc.hashtags ? selectedDesc.hashtags.join(' ') : '#shorts #facts #viral';

    if (description.includes('{{AFFILIATE_LINK}}')) {
        description = description.replace('{{AFFILIATE_LINK}}', scriptData.selectedAffiliateCopy || '');
    } else {
        description = `${description}\n\n${hashtags}\n\n${scriptData.selectedAffiliateCopy || ''}`;
    }

    description = description.trim();

    const tags = [
        'shorts',
        'facts',
        'fakta',
        'indonesia',
        'viral',
        'trending',
        'educational',
        'informatif'
    ];

    const requestBody = {
        snippet: {
            title: title,
            description: description,
            tags: tags,
            categoryId: '27',
            defaultLanguage: 'id',
            defaultAudioLanguage: 'id'
        },
        status: {
            privacyStatus: config.youtube.uploadPrivacy,
            selfDeclaredMadeForKids: false
        }
    };

    try {
        const response = await youtube.videos.insert({
            part: 'snippet,status',
            requestBody: requestBody,
            media: {
                body: fs.createReadStream(videoFile)
            }
        });

        return response.data.id;

    } catch (error) {
        throw new Error(`YouTube upload failed: ${error.message}`);
    }
}
