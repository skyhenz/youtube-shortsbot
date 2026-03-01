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
        topic: 'Efek Dunning-Kruger: Rahasia Kenapa Orang Bodoh Selalu Merasa Pintar',
        narration: 'Pernah gak kamu ketemu orang yang merasa paling pintar, padahal dia paling salah? Anehnya, semakin sedikit orang tahu, semakin percaya diri mereka bicara. Ini disebut Efek Dunning-Kruger. Otak mereka kekurangan kemampuan untuk menyadari kegagalan mereka sendiri. Tapi yang jarang orang tahu, ini bisa terjadi padamu kalau kamu berhenti belajar. Jangan sampai kamu jadi "Si Paling Tahu" yang ternyata paling zonk. Sekarang coba pikirkan orang ini di sekitarmu...',
        screenTexts: ['MAKIN BODO MAKIN PD?', 'DUNNING-KRUGER EFFECT', 'ILUSI KEPINTARAN', 'TRAP BELAJAR', 'SADARI KEBODOHANMU', 'JANGAN JADI ZONK', 'SIAPA ORANGNYA?']
    },
    {
        topic: 'Confirmation Bias: Kenapa Kamu Selalu Benar (Meski Kamu Salah)',
        narration: 'Hati-hati, otakmu sedang memanipulasi kamu sekarang! Kamu hanya mencari hal yang mendukung keyakinanmu dan mengabaikan fakta lainnya. Ini alasan kenapa kamu susah sekali didebat. Ini bagian paling berbahaya: kamu merasa objektif, padahal kamu cuma di dalam penjara pikiranmu sendiri. Keluar sekarang atau selamanya tertipu. Kamu yakin kamu benar? Coba tonton lagi ini...',
        screenTexts: ['OTAKMU MANIPULATOR!', 'MAU MENANG SENDIRI?', 'PENJARA PIKIRAN', 'FAKTA VS KEYAKINAN', 'KELUAR DARI FILTER', 'JANGAN MAU TERTIPU', 'TONTON LAGI DEH!']
    },
    {
        topic: 'Halo Effect: Kenapa Kamu Tertipu Wajah Tampan & Cantik',
        narration: 'Jangan percaya dengan wajah cantik atau tampan! Secara otomatis, otakmu menganggap orang menarik itu juga pintar dan jujur. Ini jebakan evolusi bernama Halo Effect. Kamu memaafkan kesalahan mereka karena penampilan mereka "kelihatan baik". Tapi ingat, penampilan hanyalah topeng evolusi yang menipumu habis-habisan. Masih gak percaya? Coba lihat sekelilingmu sekarang...',
        screenTexts: ['JANGAN PERCAYA WAJAH!', 'ILUSI KETAMPANAN', 'HALO EFFECT MURAHAN', 'JEBAKAN EVOLUSI', 'PENAMPILAN ADALAH TOPENG', 'KAMU SEDANG TERTIPU?', 'LIHAT SEKITARMU!']
    },
    {
        topic: 'Sunk Cost Fallacy: Kenapa Kamu Susah Move On',
        narration: 'Kamu masih bertahan di hubungan toxic karena sudah lama pacaran? Kamu sedang terjebak Sunk Cost Fallacy! Logika otakmu salah: kamu memprioritaskan waktu yang sudah hilang, bukan masa depan yang masih bisa diselamatkan. Waktu yang sudah terbuang TIDAK AKAN PERNAH kembali. Berhenti sekarang atau rugi selamanya. Kamu mau buang waktu lagi? Coba dengar ini sekali lagi...',
        screenTexts: ['SUSAH MOVE ON?', 'JEBAKAN SUNK COST', 'HUBUNGAN TOXIC!', 'MASALAH LOGIKA OTAK', 'WAKTU GAK KEMBALI', 'SELAMATKAN MASA DEPAN', 'DENGAR LAGI INI!']
    },
    {
        topic: 'Dark Psychology: Cara Membaca Pikiran Lewat Jarak Pupil Mata',
        narration: 'Tatap matanya sekarang! Jika pupil seseorang membesar saat bicara denganmu, mereka mungkin sangat tertarik padamu atau mereka sedang berbohong dengan emosi kuat. Tapi jika pupilnya mengecil, mereka sedang menjauh secara emosional. Mata tidak bisa berbohong meski mulutnya penuh janji manis. Inilah kelemahan terbesar manusia yang jarang diketahui. Sekarang coba cek mata mereka...',
        screenTexts: ['BACA PIKIRAN LEWAT MATA!', 'MATA TIDAK BISA BOHONG', 'PUPIL MEMBESAR = MINAT?', 'EMOSI VS LOGIKA', 'KELEMAHAN TERBESAR', 'CEK MATA MEREKA!', 'MASIH GAK PERCAYA?']
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
