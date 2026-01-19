import fs from 'fs/promises';
import matter from 'gray-matter';

export default async function generateScript(contentPackagePath) {
    const content = await fs.readFile(contentPackagePath, 'utf-8');

    const lines = content.split('\n');
    let scriptData = {
        topic: '',
        narration: '',
        screenTexts: [],
        voiceSettings: {},
        visualSettings: {},
        videoSettings: {}
    };

    let currentSection = '';
    let narrationLines = [];
    let screenTextLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('## TOPIK')) {
            currentSection = 'TOPIK';
            continue;
        }
        if (line.startsWith('## SCRIPT NARASI')) {
            currentSection = 'NARASI';
            continue;
        }
        if (line.startsWith('## TEKS LAYAR')) {
            currentSection = 'TEKS_LAYAR';
            continue;
        }
        if (line.startsWith('## GAYA SUARA')) {
            currentSection = 'GAYA_SUARA';
            continue;
        }
        if (line.startsWith('## GAYA VISUAL')) {
            currentSection = 'GAYA_VISUAL';
            continue;
        }
        if (line.startsWith('## FORMAT VIDEO')) {
            currentSection = 'FORMAT_VIDEO';
            continue;
        }
        if (line === '---') {
            currentSection = '';
            continue;
        }

        if (currentSection === 'TOPIK' && line && !line.startsWith('#')) {
            scriptData.topic = line;
        }

        if (currentSection === 'NARASI' && line && !line.startsWith('**[')) {
            narrationLines.push(line);
        }

        if (currentSection === 'TEKS_LAYAR' && line && line.match(/^\d+\./)) {
            const text = line.replace(/^\d+\.\s*/, '');
            screenTextLines.push(text);
        }

        if (currentSection === 'GAYA_VISUAL') {
            if (line.startsWith('- Gradasi')) {
                const match = line.match(/(#[A-F0-9]{6})/gi);
                if (match && match.length >= 2) {
                    scriptData.visualSettings.bgColor1 = match[0];
                    scriptData.visualSettings.bgColor2 = match[1];
                }
            }
        }
    }

    scriptData.narration = narrationLines.filter(l => l).join(' ');
    scriptData.screenTexts = screenTextLines;

    scriptData.visualSettings = {
        bgColor1: scriptData.visualSettings.bgColor1 || '#000000',
        bgColor2: scriptData.visualSettings.bgColor2 || '#1a1a1a',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        fontSize: 85,
        fontSizeAccent: 110
    };

    return scriptData;
}
