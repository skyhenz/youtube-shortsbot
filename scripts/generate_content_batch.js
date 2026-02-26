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
    // ----- Psikologi & Perilaku -----
    {
        topic: 'Efek Dunning-Kruger: Semakin Bodoh Kamu, Semakin Pintar Kamu Merasa',
        narration: 'Studi menemukan bahwa orang yang paling tidak kompeten justru paling percaya diri. Ini disebut Efek Dunning-Kruger. Orang yang baru belajar sesuatu merasa sudah ahli, sementara para ahli sejati justru penuh keraguan. Kenapa? Karena untuk tahu seberapa buruk kamu, kamu butuh pengetahuan yang sama untuk menilainya. Solusinya? Terus belajar. Semakin dalam kamu menyelami suatu bidang, semakin kamu sadar betapa luasnya yang belum kamu ketahui.',
        screenTexts: ['Efek Dunning-Kruger', 'Makin Bodo Makin PD', 'Pemula vs Ahli', 'Kurang Tahu = Terlalu Yakin', 'Ahli Selalu Meragukan Diri', 'Terus Belajar adalah Kuncinya']
    },
    {
        topic: 'Paradoks Pilihan: Kenapa Banyak Pilihan Membuat Kamu Tidak Bahagia',
        narration: 'Bayangkan kamu masuk ke toko dan ada tiga rasa es krim. Mudah memilih, bukan? Tapi bagaimana kalau ada seratus rasa? Penelitian Barry Schwartz membuktikan terlalu banyak pilihan justru membuat kita tidak puas apapun yang kita pilih. Kita terus membayangkan pilihan lain yang mungkin lebih baik. Inilah Paradoks Pilihan. Di era digital, kita punya pilihan tak terbatas untuk segalanya. Akibatnya, kita sering merasa tidak pernah cukup bahagia dengan apa yang kita miliki.',
        screenTexts: ['Paradoks Pilihan', 'Terlalu Banyak Opsi', 'Es Krim 100 Rasa', 'Pilih Malah Menyesal', 'FOMO Digital Sejati', 'Kurangi Pilihan, Tambah Bahagia']
    },
    {
        topic: 'Priming Effect: Cara Dunia Memanipulasi Pikiranmu Tanpa Sadar',
        narration: 'Jika kamu baru saja melihat kata "pisau", kamu akan lebih cepat mengenal kata "garpu" daripada kata "meja". Inilah Priming Effect. Satu rangsangan mempersiapkan otakmu untuk merespons stimulus berikutnya lebih cepat. Iklan menggunakannya: tunjukkan orang bahagia sambil minum minuman, dan otakmu menghubungkan minuman itu dengan kebahagiaan. Toko swalayan memutar musik lambat agar kamu belanja lebih lama. Sadar atau tidak, setiap saat dunia sedang mem-prime pikiranmu.',
        screenTexts: ['Priming Effect', 'Pikiran Bisa Di-program', 'Iklan Manipulasi Otakmu', 'Musik di Supermarket', 'Koneksi Bawah Sadar', 'Waspadai Lingkunganmu']
    },
    {
        topic: 'Keefektifan Hukuman vs Hadiah dalam Mengubah Perilaku (Ilmu Psikologi)',
        narration: 'B.F. Skinner membuktikan bahwa hadiah jauh lebih efektif mengubah perilaku dibanding hukuman. Hukuman hanya mengajarkan apa yang tidak boleh dilakukan, tanpa mengajarkan apa yang harus dilakukan. Ia juga menciptakan rasa takut dan bisa merusak hubungan. Sementara hadiah memperkuat perilaku positif dan membangun motivasi internal. Ini berlaku untuk mendidik anak, melatih karyawan, bahkan melatih diri sendiri. Ganti ancaman dengan penghargaan, dan hasilnya akan berbeda drastis.',
        screenTexts: ['Hukuman vs Hadiah', 'Skinner Buktikan Ini', 'Hukuman Ciptakan Takut', 'Hadiah Membangun Motivasi', 'Berlaku untuk Semua Orang', 'Ganti Ancaman Jadi Apresiasi']
    },
    {
        topic: 'Social Proof: Kenapa Kamu Ikut-Ikutan Orang Lain (Psikologi Massa)',
        narration: 'Mengapa restoran yang ramai selalu terlihat lebih menarik dari yang sepi? Mengapa produk ribuan ulasan terjual lebih banyak? Inilah Social Proof. Otak kita percaya bahwa jika banyak orang melakukan sesuatu, pasti itu benar. Ini adalah mekanisme bertahan hidup kuno: dalam kelompok, ikuti yang dilakukan mayoritas. Di era modern, ini dimanfaatkan oleh merek, platform media sosial, dan politisi. Sadar akan hal ini adalah langkah pertama untuk berpikir mandiri.',
        screenTexts: ['Social Proof Psikologi', 'Restoran Ramai vs Sepi', 'Ribuan Ulasan = Terpercaya?', 'Naluri Kawanan Manusia', 'Dimanfaatkan Merek Besar', 'Berpikirlah Mandiri!']
    },
    {
        topic: 'Confirmation Bias: Kamu Hanya Percaya Hal yang Kamu Mau Percaya',
        narration: 'Otak manusia secara aktif mencari informasi yang mendukung apa yang sudah kita percaya dan mengabaikan yang tidak sesuai. Ini disebut Confirmation Bias. Jika kamu percaya vaksin berbahaya, kamu hanya membaca artikel yang membenarkan itu. Jika kamu percaya seseorang jahat, setiap tindakannya terlihat jahat bagimu. Ini penyebab utama polarisasi dan konflik. Cara melawannya? Secara aktif cari argumen yang berlawanan dengan keyakinanmu dan evaluasi dengan pikiran terbuka.',
        screenTexts: ['Confirmation Bias', 'Otak Pilih Informasi', 'Kamu Hanya Percaya Ini', 'Penyebab Polarisasi', 'Filter Bubble di Medsos', 'Latih Pikiran Terbuka']
    },
    {
        topic: 'Efek Halo: Kenapa Orang Tampan Kelihatan Lebih Pintar dan Baik',
        narration: 'Penelitian membuktikan: kita cenderung menganggap orang yang menarik secara fisik juga lebih pintar, lebih jujur, dan lebih kompeten. Ini disebut Efek Halo. Seorang terdakwa yang tampan mendapat hukuman lebih ringan. Guru menilai siswa cantik lebih cerdas. Kita membeli produk dari influencer tampan karena "pasti bagus". Efek ini terjadi otomatis di bawah sadar. Sadarilah bahwa penampilan fisik tidak menentukan karakter, kecerdasan, atau kejujuran seseorang.',
        screenTexts: ['Efek Halo Psikologi', 'Tampan = Lebih Pintar?', 'Hakim dan Terdakwa', 'Guru Nilai Siswa Cantik', 'Beli dari Influencer', 'Penampilan ≠ Karakter']
    },
    {
        topic: 'Sunk Cost Fallacy: Kenapa Kamu Susah Melepaskan Hal yang Merugikan',
        narration: 'Kamu sudah menonton film selama satu jam dan membosankan. Meskipun begitu, kamu tetap menonton sampai habis karena sudah terlanjur bayar. Logikanya salah! Satu jam yang sudah terbuang tidak bisa kembali. Ini disebut Sunk Cost Fallacy. Kita terus bertahan di hubungan yang toxic, pekerjaan yang tidak cocok, atau investasi yang merugi hanya karena sudah terlanjur menginvestasikan waktu dan uang. Keputusan terbaik mempertimbangkan masa depan, bukan masa lalu yang tidak bisa diubah.',
        screenTexts: ['Sunk Cost Fallacy', 'Film Bosan Tetap Ditonton', 'Uang Hilang Tidak Kembali', 'Hubungan Toxic Bertahan', 'Keputusan Harus Logis', 'Masa Depan, Bukan Masa Lalu']
    },
    // ----- Otak & Sains -----
    {
        topic: 'Neuroplastisitas: Otakmu Bisa Berubah Sampai Kamu Mati',
        narration: 'Selama puluhan tahun, ilmuwan percaya otak manusia berhenti berkembang setelah masa kanak-kanak. Tapi penelitian modern membuktikan sebaliknya. Neuroplastisitas menunjukkan otak bisa membentuk jalur saraf baru sepanjang hidup. Setiap kali kamu belajar hal baru, otak secara harfiah berubah bentuk. Musisi punya korteks motorik lebih besar. Sopir taksi punya hippocampus yang lebih tebal. Artinya tidak ada kata terlambat untuk belajar, berubah, atau menjadi versi lebih baik dari dirimu.',
        screenTexts: ['Neuroplastisitas Otak', 'Otak Bisa Berubah Seumur Hidup', 'Belajar = Ubah Otak', 'Otak Musisi vs Normal', 'Sopir Taksi Hippocampus', 'Tidak Ada Kata Terlambat']
    },
    {
        topic: 'Mengapa Kamu Tidak Bisa Menggelitik Dirimu Sendiri (Sains Otak)',
        narration: 'Coba gelitik dirimu sendiri. Tidak ada rasanya, bukan? Tapi kalau orang lain menggelitikmu, langsung ketawa. Kenapa? Otak secara konstan memprediksi sensasi yang disebabkan oleh gerakanmu sendiri dan mengabaikannya. Ini disebut efek prediksi propi-ose-eptif. Jika otak tidak bisa membedakan dirimu dari dunia luar, kamu bisa salah tanggal dengan setiap angin sepoi-sepoi. Itulah kenapa hanya hal tak terduga yang terasa menggelitik. Otak selalu selangkah lebih depan dari tubuhmu.',
        screenTexts: ['Kenapa Susah Gelitik Diri', 'Otak Prediksi Gerakanmu', 'Efek Proprioseptif', 'Tak Terduga = Terasa', 'Otak Selalu Lebih Cepat', 'Misteri Otak Manusia']
    },
    {
        topic: 'Efek Tetris: Kenapa Game Bisa Menghantui Pikiranmu',
        narration: 'Pernah main game sampai malam, lalu pas mau tidur kamu masih melihat potongan Tetris jatuh di langit-langit? Ini disebut Efek Tetris. Otak sangat pandai memberi pola pada hal yang baru saja dipelajari. Pemain Tetris intens mulai melihat pola Tetris di mana-mana. Fenomena ini sebenarnya positif: artinya otakmu aktif memproses dan mengkonsolidasi informasi baru, bahkan saat kamu tidak sadar. Ini alasan kenapa belajar sebelum tidur sangat efektif untuk mengingat.',
        screenTexts: ['Efek Tetris', 'Game Hantui Mimpi', 'Otak Suka Pola', 'Belajar Sebelum Tidur', 'Konsolidasi Memori', 'Manfaatkan Efek Ini!']
    },
    {
        topic: 'Kenapa Musik Bisa Membuat Kamu Merinding (Ilmu di Balik Frisson)',
        narration: 'Pernahkah kamu mendengarkan lagu dan tiba-tiba bulu kudukmu berdiri? Ini disebut Frisson, dan hanya sekitar 65 persen orang bisa merasakannya. Orang yang mengalami Frisson rata-rata punya koneksi lebih banyak antara korteks auditori dan area yang memproses emosi. Merinding saat mendengar musik adalah bukti bahwa otakmu bereaksi terhadap kejutan melodi, sama seperti respons terhadap bahaya. Jika kamu sering merinding saat dengar musik, itu artinya kamu punya otak yang lebih sensitif secara emosional.',
        screenTexts: ['Frisson: Bulu Kuduk Berdiri', 'Cuma 65% Orang Rasakan', 'Koneksi Otak Lebih Banyak', 'Musik = Respons Bahaya', 'Sensitif Secara Emosional', 'Otakmu Istimewa!']
    },
    // ----- Produktivitas & Hidup -----
    {
        topic: 'Teknik Pomodoro: Cara Kerja 25 Menit yang Mengubah Produktivitas',
        narration: 'Pada tahun 1980-an, Francesco Cirillo berjuang dengan konsentrasi. Ia kemudian mengatur timer dapur berbentuk tomat selama 25 menit dan berkomitmen hanya fokus selama itu. Lahirlah Teknik Pomodoro. Cara kerjanya: kerja fokus 25 menit, istirahat 5 menit, ulangi. Setiap 4 sesi, istirahat panjang 15 sampai 30 menit. Ini bekerja karena berlawanan dengan kecenderungan otak untuk multitasking dan prokrastinasi. Bahkan NASA menggunakan prinsip ini dalam latihan astronaut.',
        screenTexts: ['Teknik Pomodoro', 'Timer Berbentuk Tomat', 'Kerja 25 Menit Fokus', 'Istirahat 5 Menit', 'NASA Pakai Ini Juga', 'Kalahkan Prokrastinasi!']
    },
    {
        topic: 'Hukum Parkinson: Kenapa Deadline Membuat Kita Lebih Produktif',
        narration: 'Jika kamu punya seminggu untuk menyelesaikan tugas satu hari, kamu akan menggunakan seminggu penuh. Inilah Hukum Parkinson: pekerjaan mengembang untuk mengisi waktu yang tersedia. Ini menjelaskan kenapa kita selalu menyelesaikan tugas di menit terakhir. Solusinya? Buat deadline buatan yang lebih ketat dari deadline sebenarnya. Tetapkan batas waktu 50 persen lebih pendek. Kamu akan terkejut seberapa banyak yang bisa diselesaikan ketika waktu dibatasi secara artificial.',
        screenTexts: ['Hukum Parkinson', 'Tugas Mengisi Waktu', 'Kenapa Selalu Mepet', 'Deadline Buatan Berhasil', 'Potong Waktu 50 Persen', 'Produktif Sekarang!']
    },
    {
        topic: 'Atomic Habits: Perubahan 1 Persen Sehari yang Revolusioner',
        narration: 'Jika kamu menjadi satu persen lebih baik setiap hari selama satu tahun, kamu akan 37 kali lebih baik di akhir tahun. Jika kamu menjadi satu persen lebih buruk setiap hari, kamu akan hampir nol di akhir tahun. James Clear dalam Atomic Habits membuktikan: bukan perubahan besar yang mengubah hidup, melainkan perubahan kecil yang konsisten setiap hari. Identitas menentukan kebiasaan: jangan bilang "saya mau olahraga", tapi bilang "saya adalah orang yang aktif". Jadikan perubahan bagian dari identitasmu.',
        screenTexts: ['1% Lebih Baik Tiap Hari', '37x di Akhir Tahun', 'Atomic Habits Terbukti', 'Perubahan Kecil Konsisten', 'Identitas Menentukan Kebiasaan', 'Kamu Adalah Siapa?']
    },
    // ----- Sosial & Hubungan -----
    {
        topic: 'Efek Pratfall: Kenapa Orang Sempurna Terlihat Kurang Menarik',
        narration: 'Seorang kandidat yang menjawab semua pertanyaan wawancara dengan sempurna menumpahkan kopi di mejanya. Anehnya, dia mendapat nilai lebih tinggi dari evaluator dibanding kandidat yang sempurna tanpa insiden. Ini disebut Efek Pratfall. Kesalahan kecil dari orang yang kompeten justru membuatnya lebih disukai dan terasa lebih manusiawi. Ini kenapa kita suka pemimpin yang mau mengakui kesalahan. Jadi berhentilah berusaha tampak sempurna. Kerentananmu malah menjadi kekuatanmu.',
        screenTexts: ['Efek Pratfall', 'Kandidat Tumpah Kopi', 'Salah Kecil = Lebih Disukai', 'Manusiawi itu Menarik', 'Pemimpin yang Mengaku Salah', 'Kelemahan adalah Kekuatan']
    },
    {
        topic: 'Teori Attachment: Gaya Cintamu Ditentukan Saat Kamu Bayi',
        narration: 'Psikolog John Bowlby menemukan bahwa cara kita berhubungan dalam cinta di masa dewasa dibentuk oleh pengalaman dengan pengasuh di usia nol sampai tiga tahun. Ada tiga gaya utama: Secure, Anxious, dan Avoidant. Secure terbentuk dari pengasuh yang konsisten dan responsif. Anxious dari pengasuh yang tidak konsisten. Avoidant dari pengasuh yang sering menolak. Kabar baiknya: meskipun gaya attachment dibentuk sejak bayi, ia bisa berubah melalui hubungan yang sehat dan terapi di masa dewasa.',
        screenTexts: ['Teori Attachment', 'Cara Cinta Dibentuk Bayi', 'Secure vs Anxious vs Avoidant', 'Pengasuh Pengaruhi Segalanya', 'Bayi 0-3 Tahun Kritis', 'Gaya Cinta Bisa Berubah']
    },
    {
        topic: 'Love Languages: 5 Bahasa Cinta dan Kenapa Pasanganmu Merasa Tidak Dicintai',
        narration: 'Gary Chapman menemukan bahwa setiap orang punya cara berbeda merasakan dan mengekspresikan cinta. Ada lima bahasa cinta: Kata-kata Afirmasi untuk yang butuh pujian verbal. Waktu Berkualitas untuk yang butuh perhatian penuh. Menerima Hadiah untuk yang butuh gestur fisik. Tindakan Pelayanan untuk yang butuh bantuan. Sentuhan Fisik untuk yang butuh kontak fisik. Konflik dalam hubungan sering terjadi bukan karena tidak cinta, tapi karena pasangan bicara bahasa cinta yang berbeda.',
        screenTexts: ['5 Bahasa Cinta', 'Kata-kata Afirmasi', 'Waktu Berkualitas', 'Hadiah vs Pelayanan', 'Sentuhan Fisik Penting', 'Bicara Bahasa yang Sama!']
    },
    // ----- Fakta Mengejutkan -----
    {
        topic: 'Kenapa Langit Biru tapi Matahari Terbenam Merah? (Sains Warna)',
        narration: 'Cahaya matahari sebenarnya mengandung semua warna. Saat melewati atmosfer, partikel udara memecah cahaya. Cahaya biru punya gelombang pendek dan mudah tersebar ke semua arah, makanya langit terlihat biru. Tapi saat matahari terbenam, cahaya harus melewati atmosfer yang lebih tebal. Cahaya biru tersebar habis, yang tersisa hanya merah dan oranye yang gelombangnya lebih panjang. Ini juga kenapa matahari terbenam di kota terlihat lebih dramatis: polusi dan partikel lebih banyak = warna lebih intense.',
        screenTexts: ['Kenapa Langit Biru?', 'Cahaya Matahari Multi Warna', 'Partikel Sebar Cahaya Biru', 'Gelombang Pendek vs Panjang', 'Atmosfer Lebih Tebal', 'Polusi = Sunset Lebih Cantik']
    },
    {
        topic: 'Paradoks Fermi: Di Mana Semua Alien Itu?',
        narration: 'Ada sekitar 200 miliar bintang di galaksi Bima Sakti saja. Banyak dari mereka punya planet. Secara statistika, seharusnya ada ribuan peradaban alien yang jauh lebih maju dari kita. Tapi kenapa kita tidak pernah mendengar dari mereka? Inilah Paradoks Fermi. Beberapa teori: mungkin kita memang sendirian, mungkin mereka menghindari kita dengan sengaja, mungkin sinyal mereka tidak bisa kita deteksi, atau mungkin peradaban maju selalu menghancurkan diri sendiri sebelum kita sempat bertemu.',
        screenTexts: ['Paradoks Fermi', '200 Miliar Bintang', 'Secara Statistik Ada Alien', 'Kenapa Takada Kontak?', 'Teori Great Filter', 'Kita Benar-benar Sendirian?']
    },
    {
        topic: 'Kenapa Kita Tidak Ingat Masa Bayi? (Amnesia Infantil)',
        narration: 'Kamu pernah mengalami ulang tahun pertama, belajar berjalan, dan merasakan kasih sayang pertama. Tapi tidak ada yang bisa mengingatnya. Ini disebut Amnesia Infantil. Hippo-kampus, bagian otak yang mengolah memori jangka panjang, belum sepenuhnya berkembang sampai usia tiga sampai empat tahun. Selain itu, kita belum punya bahasa untuk mengkodekan pengalaman menjadi memori yang bisa diingat. Memori juga bersifat sosial: kita mengingat hal yang bisa kita ceritakan ulang kepada orang lain.',
        screenTexts: ['Amnesia Infantil', 'Kenapa Lupa Masa Bayi?', 'Hippocampus Belum Matang', 'Bahasa Kodekan Memori', 'Memori Itu Sosial', 'Otak Bayi vs Dewasa']
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
        const processed = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'paket_konten'), 'utf-8').catch(() => '[]'));
        usedTopics = processed;
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
