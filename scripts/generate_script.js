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

    // Load CTA list and select one randomly (unless already provided)
    const ctaList = JSON.parse(await fs.readFile(path.join(process.cwd(), 'config', 'cta_list.json'), 'utf-8'));
    const selectedCTA = ctaList[Math.floor(Math.random() * ctaList.length)];

    if (scriptData.narration.toLowerCase().includes('subscribe') || scriptData.narration.toLowerCase().includes('follow')) {
        console.log('ℹ️ Script already contains CTA, skipping auto-injection.');
        // Extract the last sentence if it looks like a CTA
        const sentences = scriptData.narration.split(/(?<=[.!?])\s+/);
        scriptData.selectedCTA = sentences[sentences.length - 1];
    } else {
        scriptData.selectedCTA = selectedCTA;
        // Growth Hack: Seamless Loop CTA Integration
        if (scriptData.narration.endsWith('...')) {
            const sentences = scriptData.narration.split(/(?<=[.!?])\s+/);
            if (sentences.length > 2) {
                const lastPhrase = sentences.pop();
                scriptData.narration = `${sentences.join(' ')} ${selectedCTA} ${lastPhrase}`.trim();
            } else {
                scriptData.narration = `${selectedCTA} ${scriptData.narration}`.trim();
            }
        } else {
            scriptData.narration = `${scriptData.narration} ${selectedCTA}`.trim();
        }
    }

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
