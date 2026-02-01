import path from 'path';
import { fileURLToPath } from 'url';
import generateScript from '../scripts/generate_script.js';
import fs from 'fs/promises';

describe('CTA selection test', () => {
    const tempPackagePath = path.join(process.cwd(), 'temp_test_package.md');
    const packageContent = `# PAKET KONTEN YOUTUBE SHORTS #003\n\n## TOPIK\nTest Topic\n\n---\n\n## SCRIPT NARASI\nTest narration line.\n\n---`;

    beforeAll(async () => {
        await fs.writeFile(tempPackagePath, packageContent, 'utf-8');
    });

    afterAll(async () => {
        await fs.unlink(tempPackagePath).catch(() => { });
    });

    test('selectedCTA should be one of the CTA list', async () => {
        const scriptData = await generateScript(tempPackagePath);
        const ctaList = JSON.parse(await fs.readFile(path.join(process.cwd(), 'config', 'cta_list.json'), 'utf-8'));
        expect(ctaList).toContain(scriptData.selectedCTA);
    });
});
