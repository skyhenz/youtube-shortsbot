/**
 * generate_content_batch.js
 * Auto-generate multiple paket_konten files from a large topic pool.
 * Run standalone: node scripts/generate_content_batch.js [count]
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOPIC_POOL = [
    {
        // TYPE: Pattern Recognition (Insider Tone)
        topic: 'Decision Awareness: Sinyal Mikro di Balik Pilihan Fatal',
        narration: 'Ini biasanya cuma dibahas di lingkaran intelijen tertentu. Kebanyakan orang pikir pilihan diambil secara sadar. Padahal, ada arsitektur pattern recognition yang mendikte otakmu. Setelah ngelihat ratusan kasus, polanya selalu sama. Ini pengamatan berulang, bukan teori. Bagian ini memang tidak dibuka di publik. Kamu bukan kebanyakan orang.',
        screenTexts: ['DECISION AWARENESS', 'STRUKTUR PILIHAN', '100+ KASUSNYA', 'PATTERN RECOGNITION', 'BUKAN TEORI', 'INSIDER ONLY', 'YANG PAHAM TAHU']
    },
    {
        // TYPE: Clarity Escalation (Experience Signal)
        topic: 'Strategi Berpikir: Membedakan Noise dari Signal',
        narration: 'Orang yang paham ini jarang sekali ngomong di publik. Clarity sejati bukan soal menambah informasi, tapi soal eliminasi noise. Pola ini sering muncul di kasus nyata pada level profesional. Saya sudah perhatikan struktur ini bertahun-tahun. Bagian teknisnya sengaja saya lewati. Kalau kamu sampai sini, kamu tahu kenapa.',
        screenTexts: ['STRATEGI BERPIKIR', 'CLARITY SEJATI', 'ELIMINASI NOISE', 'STRUKTUR NYATA', 'LEVEL PROFESIONAL', 'REVEAL SELEKTIF', 'MELANGKAH JAUH']
    },
    {
        // TYPE: Selective Reveal (Silent Path)
        topic: 'Strategic Thinking: Mengapa Logika Sering Menipu',
        narration: 'Logika seringkali hanyalah topeng untuk bias yang tidak disadari. Setelah mengamati ribuan interaksi, polanya selalu konsisten: otak mencari konfirmasi, bukan kebenaran. Ini level lanjutan untuk mencapai decision awareness yang belum bisa dibahas sekarang. Yang paham biasanya sudah tahu.',
        screenTexts: ['LOGIKA MENIPU', 'BIAS TAK DISADARI', '1000+ INTERAKSI', 'KONSISTENSI EKSTRIM', 'LEVEL LANJUTAN', 'DECISION AWARENESS', 'TUNGGU SAJA']
    },
    {
        // TYPE: Authority Reminder (Anchor Realitas)
        topic: 'Pattern Recognition: Rahasia di Balik Intuisi Tajam',
        narration: 'Intuisi bukan bakat, tapi kemampuan pattern recognition yang dilatih. Di tingkat yang lebih tinggi, ini soal memetakan arsitektur pikiran orang lain. Pola ini selalu muncul di kasus nyata tanpa kecuali. Bagian bagaimana cara memulainya memang tidak dibuka di publik. Kamu bukan kebanyakan orang.',
        screenTexts: ['INTUISI TAJAM', 'PATTERN RECOGNITION', 'ARSITEKTUR PIKIRAN', 'BUKAN BAKAT!', 'KASUS NYATA', 'INSIDER SIGNAL', 'YANG TAHU TAHU']
    },
    {
        // TYPE: Strategic Awareness (Insider Tone)
        topic: 'Decision Architecture: Mengapa Kamu Tidak Pernah Benar-Benar Memilih',
        narration: 'Ini rahasia yang biasanya cuma dibahas di balik pintu tertutup. Setiap pilihanmu sudah dirancang oleh arsitektur yang tidak kamu lihat. Setelah bertahun-tahun menganalisis struktur ini, polanya sangat jelas. Ini pengamatan berulang, bukan teori. Kalau kamu sampai sini, kamu bukan kebanyakan orang.',
        screenTexts: ['DECISION ARCHITECTURE', 'Bukan Pilihanmu!', 'PINTU TERTUTUP', 'STRUKTUR TERSEMBUNYI', 'BUKAN TEORI', 'PIKIRAN TERDIKTE', 'BACA BIO.']
    }
];

const contentDir = path.join(__dirname, '..', 'paket_konten');

async function getNextNumber() {
    const files = await fs.readdir(contentDir);
    const nums = files
        .filter(f => f.match(/^paket_konten_\d{3}\.md$/))
        .map(f => parseInt(f.match(/\d{3}/)[0]));
    return nums.length > 0 ? Math.max(...nums) + 1 : 26;
}

async function generateBatch(count = 5) {
    await fs.mkdir(contentDir, { recursive: true });

    let nextNum = await getNextNumber();
    let generated = 0;

    // Shuffle topic pool
    const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5);

    for (const item of shuffled) {
        if (generated >= count) break;

        const filename = `paket_konten_${String(nextNum).padStart(3, '0')}.md`;
        const filepath = path.join(contentDir, filename);

        // Check if file already exists
        try {
            await fs.access(filepath);
            nextNum++;
            continue;
        } catch { }

        // ❌ SILENT PATH MONETIZATION: No explicit CTAs. The narration itself is the authority builder.
        const fullNarration = item.narration.trim();

        const content = `# PAKET AUTHORITY #${String(nextNum).padStart(3, '0')}

## TOPIK
${item.topic}

## SCRIPT NARASI
${fullNarration}

## TEKS LAYAR
${item.screenTexts.map((t, i) => `${i + 1}. ${t.toUpperCase()}`).join('\n')}

## GAYA VISUAL
- Minimalist, Professional, Evidence-based
- Mode: Dark, Cinematic, Premium
- Keywords: minimalist abstract background data visualization evidence
- Color: Deep Black (#080808) & Steel Blue (#1E272E)

## DESKRIPSI VIDEO
${item.narration}

#authority #psychology #monetization #shorts #indonesia #professional
`;

        await fs.writeFile(filepath, content, 'utf-8');
        console.log(`✅ Authority Content Generated: ${filename}`);
        nextNum++;
        generated++;
    }

    console.log(`\n📦 Total ${generated} paket otoritas baru berhasil di-generate.`);
    return generated;
}

// Run directly if called as main script
const countArg = parseInt(process.argv[2]) || 5;
generateBatch(countArg).catch(err => {
    console.error('❌ Error generating batch:', err.message);
    process.exit(1);
});

export { generateBatch, TOPIC_POOL };
