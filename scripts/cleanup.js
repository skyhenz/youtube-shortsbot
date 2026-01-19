import fs from 'fs/promises';

export default async function cleanup(...files) {
    for (const file of files) {
        try {
            await fs.unlink(file);
            console.log(`🗑️ Deleted: ${file}`);
        } catch (err) {
            console.warn(`⚠️ Could not delete ${file}:`, err.message);
        }
    }
}
