import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';

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
    let descriptionLines = [];

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
        if (line.startsWith('## DESKRIPSI VIDEO')) {
            currentSection = 'DESKRIPSI';
            continue;
        }
        if (line === '---') {
            currentSection = '';
            continue;
        }

        if (currentSection === 'TOPIK' && line && !line.startsWith('#')) {
            scriptData.topic = line;
        }

        if (currentSection === 'DESKRIPSI' && line && !line.startsWith('#')) {
            descriptionLines.push(line);
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
            if (line.startsWith('- Keywords:')) {
                scriptData.visualSettings.keywords = line.replace('- Keywords:', '').trim();
            }
        }
    }

    scriptData.narration = narrationLines.filter(l => l).join(' ');

    // ❌ ALGORITHM RULE: No explicit CTAs like "Subscribe/Follow"
    // We only keep the psychological loop ending.
    scriptData.selectedCTA = ""; // Clear visual CTA
    console.log('🤫 Algorithm Mode: Explicit CTA suppressed for maximum retention.');

    scriptData.screenTexts = screenTextLines;
    scriptData.description = descriptionLines.join('\n').trim();

    scriptData.visualSettings = {
        bgColor1: scriptData.visualSettings.bgColor1 || '#000000',
        bgColor2: scriptData.visualSettings.bgColor2 || '#1a1a2e',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        fontSize: 65, // Reduced from 85
        fontSizeAccent: 85 // Reduced from 110
    };

    return scriptData;
}
