import fs from 'fs';
import { google } from 'googleapis';
import config from '../config/config.js';

const OAuth2 = google.auth.OAuth2;

async function getAuthenticatedClient() {
    const oauth2Client = new OAuth2(
        config.youtube.clientId,
        config.youtube.clientSecret,
        'urn:ietf:wg:oauth:2.0:oob'
    );

    oauth2Client.setCredentials({
        refresh_token: config.youtube.refreshToken
    });

    return oauth2Client;
}

export default async function uploadYoutube(videoFile, scriptData) {
    const auth = await getAuthenticatedClient();
    const youtube = google.youtube({ version: 'v3', auth });

    const title = `${scriptData.topic} #Shorts`;
    const description = `${scriptData.topic}\n\n#shorts #facts #indonesia #viral`;

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
