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
        // TYPE: Pattern Breaker (Insider Tone)
        topic: 'Alasan Kenapa Kamu Selalu Gagal Membaca Orang',
        narration: 'Ini biasanya cuma dibahas di lingkaran intelijen tertentu. Kebanyakan orang pikir bahasa tubuh itu soal mata dan tangan. Padahal, ada sinyal mikro yang lebih jujur. Setelah ngelihat ratusan kasus, polanya selalu sama—kamu cuma ngelihat apa yang ingin kamu lihat. Bagian ini sengaja saya lewati karena terlalu teknis untuk publik. Kalau kamu tahu, kamu tahu.',
        screenTexts: ['LINGKARAN INTELIJEN', 'MIKRO-SINYAL JUJUR', '100+ KASUSNYA', 'POLA SELALU SAMA', 'SELEKTIF REVEAL', 'YANG PAHAM SAJA', 'SYARAT AUTHORITY']
    },
    {
        // TYPE: Authority Reminder (Experience Signal)
        topic: 'Pola Psikologi di Balik Manipulasi Tingkat Tinggi',
        narration: 'Orang yang paham ini jarang sekali ngomong di publik. Polanya bukan soal apa yang dikatakan, tapi soal jeda antara kata-kata. Saya sudah perhatikan ini bertahun-tahun di level profesional. Ini biasanya jadi rahasia paling dijaga di atas rata-rata. Yang paham biasanya sudah melangkah lebih jauh.',
        screenTexts: ['RAHASIA PUBLIK', 'JEDA ANTAR KATA', 'RISET TAHUNAN', 'LEVEL PROFESIONAL', 'RAHASIA DIJAGA', 'DI ATAS RATA-RATA', 'MELANGKAH JAUH']
    },
    {
        // TYPE: Soft Escalation (Selective Reveal)
        topic: 'Kenapa Kamu Merasa Mengenal Seseorang, Padahal Tidak',
        narration: 'Efek proyeksi ini sangat berbahaya jika kamu tidak tahu cara mematikannya. Setelah mengamati ribuan interaksi sosial, hanya sedikit yang benar-benar sadar sedang terjebak. Ini level lanjutan yang belum bisa dibahas sekarang karena butuh pemahaman dasar yang kuat. Kalau kamu tahu, kamu tahu.',
        screenTexts: ['EFEK PROYEKSI', 'BERBAHAYA!', '1000+ INTERAKSI', 'TERJEBAK PIKIRAN', 'LEVEL LANJUTAN', 'PEMAHAMAN DASAR', 'SYARAT MENGERTI']
    },
    {
        // TYPE: Pattern Breaker (Authority Signal)
        topic: 'Mitos Terbesar Tentang Produktivitas yang Kamu Percaya',
        narration: 'Apa yang diajarkan buku-buku populer itu biasanya cuma permukaan. Di tingkat yang lebih tinggi, produktivitas bukan soal manajemen waktu, tapi soal proteksi energi kognitif. Pola ini selalu konsisten di antara orang-orang paling berpengaruh. Bagian bagaimana cara memulainya mungkin nanti saja. Yang paham biasanya sudah melangkah lebih jauh.',
        screenTexts: ['PRODUKTIVITAS MITOS', 'PERMUKAAN SAJA', 'ENERGI KOGNITIF', 'KONSISTEM EKSTRIM', 'ORANG BERPENGARUH', 'LEVEL TINGGI', 'MELANGKAH JAUH']
    },
    {
        // TYPE: Authority Reminder (Insider Tone)
        topic: 'Rahasia Gelap di Balik Persuasi yang Tidak Pernah Diajarkan',
        narration: 'Ini biasanya cuma dibahas di balik pintu tertutup. Persuasi sejati tidak butuh argumen, hanya butuh arsitektur pilihan. Setelah bertahun-tahun menganalisis struktur ini, saya sadar kebanyakan orang adalah korban tanpa sadar. Ini biasanya jadi rahasia lingkaran tertentu. Kalau kamu tahu, kamu tahu.',
        screenTexts: ['PINTU TERTUTUP', 'PERSUASI SEJATI', 'ARSITEKTUR PILIHAN', 'STRUKTUR ANALISIS', 'KORBAN TANPA SADAR', 'RAHASIA LINGKARAN', 'YANG TAHU TAHU']
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
