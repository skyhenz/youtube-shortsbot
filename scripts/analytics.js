import fs from 'fs/promises';
import path from 'path';

export default async function generateAnalytics() {
    const rotationLogPath = path.join(process.cwd(), 'logs', 'rotation.log');
    const uploadLogPattern = /upload_log_\d{6}\.json/;
    const logDir = path.join(process.cwd(), 'logs');

    try {
        const rotationData = await fs.readFile(rotationLogPath, 'utf-8');
        const lines = rotationData.trim().split('\n');

        const ctaStats = {};
        const affStats = {};

        lines.forEach(line => {
            const [date, pkg, cta, affId] = line.split(' | ');
            if (cta) ctaStats[cta] = (ctaStats[cta] || 0) + 1;
            if (affId) affStats[affId] = (affStats[affId] || 0) + 1;
        });

        // Simple frequency analysis
        const getAnalysis = (stats) => {
            const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
            return {
                recommended: sorted.slice(0, 2).map(s => s[0]),
                lowFrequency: sorted.slice(-2).map(s => s[0])
            };
        };

        const ctaAnalysis = getAnalysis(ctaStats);
        const affAnalysis = getAnalysis(affStats);

        const recommendation = {
            CTA_disarankan: ctaAnalysis.recommended,
            CTA_dihentikan: ctaAnalysis.lowFrequency,
            Affiliate_dipertahankan: affAnalysis.recommended,
            Affiliate_diganti: affAnalysis.lowFrequency
        };

        const recPath = path.join(logDir, 'ai_recommendation.json');
        await fs.writeFile(recPath, JSON.stringify(recommendation, null, 2), 'utf-8');

        console.log('\n📊 RINGKASAN ANALITIK AI:');
        console.log(`- CTA paling populer: ${ctaAnalysis.recommended[0] || 'N/A'}`);
        console.log(`- Affiliate paling stabil: ${affAnalysis.recommended[0] || 'N/A'}`);
        console.log(`- variasi unik CTA digunakan: ${Object.keys(ctaStats).length}`);
        console.log(`- File rekomendasi diperbarui: logs/ai_recommendation.json`);

    } catch (err) {
        console.warn('⚠️ Gagal menjalankan analitik (data mungkin belum cukup):', err.message);
    }
}
