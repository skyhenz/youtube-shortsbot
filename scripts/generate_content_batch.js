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
        topic: 'Dark Psychology: Rahasia Pupil Mata yang Jarang Orang Sadar',
        narration: 'TATAP MATANYA SEKARANG! Jika pupilnya membesar, dia mungkin sangat tertarik atau sedang berbohong hebat. Tapi tunggu—di sinilah orang salah paham. Riset menunjukkan pupil juga membesar saat otak bekerja terlalu keras menahan rahasia. Perhatikan grafik ini... Inilah bahaya besar menyepelekan bahasa tubuh. Otakmu baru sadar ini setelah kamu ulang dari awal—perhatikan 3 detik pertama.',
        screenTexts: ['TATAP MATANYA!', 'PUPIL MEMBESAR?', 'BAHAYA BOHONG', 'RISET MEMBUKTIKAN', 'SALAH PAHAM!', 'OTAKMU KERJA KERAS', 'LIHAT 3 DETIK AWAL']
    },
    {
        topic: 'Sunk Cost Fallacy: Kenapa Kamu Dipaksa Rugi Selamanya',
        narration: 'HUBUNGANMU TOXIC TAPI KAMU TETAP BERTAHAN? Ini bukan setia, ini adalah kerusakan logika. Tapi yang jarang orang bahas... otakmu lebih takut kehilangan apa yang sudah hilang daripada mendapatkan masa depan. Lihat data statistik ini... Inilah alasan kenapa kamu rugi selamanya jika tidak berhenti sekarang. Sekarang tonton lagi—sadari bagaimana kamu tertipu sejak awal.',
        screenTexts: ['HUBUNGAN TOXIC?', 'KERUSAKAN LOGIKA', 'JARANG DIBAHAS', 'STATISTIK KERUGIAN', 'STOP SEKARANG!', 'JANGAN MAU RUGI', 'TONTON LAGI DEH!']
    },
    {
        topic: 'Confirmation Bias: Penjara Pikiran yang Membunuh Objektivitas',
        narration: 'OTAKMU SEDANG MENIPUMU SEKARANG JUGA! Kamu hanya mau dengar apa yang ingin kamu dengar. Tunggu—ini bagian yang paling berbahaya. Kamu merasa paling benar, padahal kamu cuma di dalam penjara pikiranmu sendiri. Perhatikan kutipan riset ini... Inilah alasan kenapa dunia pecah sekarang. Otakmu baru sadar ini setelah kamu tonton ulang.',
        screenTexts: ['OTAKMU MENIPU!', 'HANYA MAU BENAR', 'BAGIAN BERBAHAYA', 'PENJARA PIKIRAN', 'DUNIA PECAH!', 'OBJEKTIVITAS MATI', 'TONTON ULANG!']
    },
    {
        topic: 'Halo Effect: Jebakan Wajah Cantik yang Menipu Otak',
        narration: 'JANGAN PERCAYA WAJAH CANTIK ATAU TAMPAN! Ini bukan soal selera, tapi soal cacat mental evolusi. Tapi di sinilah orang salah paham... kita menganggap orang menarik itu jujur tanpa bukti. Lihat eksperimen sosial ini... Inilah bahaya besar Efek Halo bagi hidupmu. Sekarang coba tonton lagi dari awal—perhatikan 3 detik pertama.',
        screenTexts: ['JANGAN PERCAYA!', 'CACAT MENTAL', 'SALAH PAHAM!', 'EKSPERIMEN SOSIAL', 'EFEK HALO BAHAYA', 'HIDUPMU TERANCAM', 'CEK 3 DETIK AWAL']
    },
    {
        topic: 'Dunning-Kruger Effect: Kenapa Orang Bodoh Merasa Paling Pintar',
        narration: 'KAMU PASTI PERNAH KETEMU ORANG INI! Mereka bicara paling keras tapi paling tidak tahu apa-apa. Tunggu—di sinilah bagian yang paling aneh. Semakin bodoh seseorang, semakin mereka merasa sudah ahli di segalanya. Perhatikan grafik kompetensi ini... Inilah alasan kenapa debat itu sia-sia. Otakmu baru sadar ini setelah kamu ulang video ini.',
        screenTexts: ['KETEMU ORANG INI?', 'PALING KERAS!', 'BAGIAN ANEH', 'GRAFIK KOMPETENSI', 'DEBAT ITU SIA-SIA', 'SADARI SEKARANG', 'ULANG VIDEO INI']
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

    // Get processed log to avoid duplicate topics
    let usedTopics = [];
    try {
        const processedFile = path.join(contentDir, '..', 'logs', 'processed.json');
        const data = await fs.readFile(processedFile, 'utf-8');
        usedTopics = JSON.parse(data);
    } catch { }

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

        const ctaOptions = [
            'Follow untuk fakta menarik lainnya!',
            'Subscribe untuk ilmu terbaik!',
            'Simpan video ini agar tidak lupa!',
            'Share ke temanmu yang perlu tau ini!',
            'Komentar jika kamu sudah tau ini!'
        ];
        const cta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
        const fullNarration = item.narration.trimEnd().endsWith('!')
            ? item.narration
            : `${item.narration} ${cta}`;

        const content = `# PAKET KONTEN AUTO #${String(nextNum).padStart(3, '0')}

## TOPIK
${item.topic}

## SCRIPT NARASI
${fullNarration}

## TEKS LAYAR
${item.screenTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## GAYA VISUAL
- Gradasi (#0D0D0D ke #1A1A2E)
- Mode: Dark, Premium, Cinematic
- Keywords: psychology facts cinematic dramatic

## DESKRIPSI VIDEO
${item.narration}

#psikologi #fakta #shorts #edukasi #viral #indonesia
`;

        await fs.writeFile(filepath, content, 'utf-8');
        console.log(`✅ Generated: ${filename}`);
        nextNum++;
        generated++;
    }

    console.log(`\n📦 Total ${generated} paket konten baru berhasil di-generate.`);
    return generated;
}

// Run directly if called as main script
const countArg = parseInt(process.argv[2]) || 5;
generateBatch(countArg).catch(err => {
    console.error('❌ Error generating batch:', err.message);
    process.exit(1);
});

export { generateBatch, TOPIC_POOL };
