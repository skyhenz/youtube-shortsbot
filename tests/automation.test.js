import fs from 'fs/promises';
import path from 'path';
import generateContent from '../scripts/content_generator.js';
import generateScript from '../scripts/generate_script.js';

describe('YouTube Shorts Bot Automation Tests', () => {
    const contentDir = path.join(process.cwd(), 'paket_konten');

    test('Content Generator should create a valid MD file', async () => {
        const filepath = await generateContent();
        const exists = await fs.access(filepath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
        expect(filepath).toMatch(/paket_konten_\d+\.md/);

        const content = await fs.readFile(filepath, 'utf-8');
        expect(content).toContain('## TOPIK');
        expect(content).toContain('## SCRIPT NARASI');
        expect(content).toContain('## TEKS LAYAR');
        expect(content).toContain('## CTA NARASI PENUTUP');
        expect(content).toContain('## DESKRIPSI VIDEO');
        expect(content).toContain('{{AFFILIATE_LINK}}');
    });

    test('Script Generator should parse generated content correctly', async () => {
        const files = await fs.readdir(contentDir);
        const lastFile = files.filter(f => f.startsWith('paket_konten_')).sort().pop();
        const filepath = path.join(contentDir, lastFile);

        const scriptData = await generateScript(filepath);
        expect(scriptData.topic).toBeDefined();
        expect(scriptData.narration).toBeDefined();
        expect(scriptData.description).toContain('{{AFFILIATE_LINK}}');
        expect(scriptData.selectedCTA).toBeDefined();
    });

    test('Log Rotation Format Check', async () => {
        const logPath = path.join(process.cwd(), 'logs', 'rotation.log');
        const exists = await fs.access(logPath).then(() => true).catch(() => false);
        if (exists) {
            const data = await fs.readFile(logPath, 'utf-8');
            const lastLine = data.trim().split('\n').pop();
            // Format: tanggal | paket_konten | CTA | affiliate_id
            expect(lastLine).toMatch(/^\d{4}-\d{2}-\d{2} \| .+\.mp4 \| .+ \| .+$/);
        }
    });
});
