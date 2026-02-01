import fs from 'fs/promises';
import path from 'path';

const TOPICS = [
    {
        name: 'Psikologi',
        facts: [
            {
                title: 'Kekuatan Fokus',
                narration: 'Tahukah Anda bahwa rata-rata rentang perhatian manusia sekarang lebih pendek daripada ikan mas? Kita hidup di era gangguan tanpa henti yang mencuri produktivitas Anda setiap detik. Fokus bukanlah tentang melakukan banyak hal sekaligus melainkan tentang keberanian untuk menyingkirkan ribuan gangguan lainnya. Saat Anda mendedikasikan seluruh perhatian pada satu tugas besar, Anda sedang melatih otak untuk mencapai kondisi fokus yang...',
                screenTexts: ['Fokus vs Gangguan', 'Rentang Perhatian Pendek', 'Era Gangguan Digital', 'Fokus Adalah Kekuatan', 'Singkirkan Gangguan', 'Kondisi Aliran Otak']
            },
            {
                title: 'Hukum Murphy',
                narration: 'Jika sesuatu bisa berjalan salah, maka ia pasti akan terjadi. Inilah inti dari Hukum Murphy yang sering kita rasakan dalam kehidupan sehari-hari. Psikologi di balik hukum ini sebenarnya adalah bias konfirmasi. Kita cenderung lebih mengingat kejadian buruk daripada saat segala sesuatunya berjalan lancar. Memahami hal ini membantu kita untuk lebih tenang dalam menghadapi situasi di mana...',
                screenTexts: ['Hukum Murphy', 'Jika Bisa Salah', 'Pasti Akan Terjadi', 'Bias Konfirmasi', 'Memori Kejadian Buruk', 'Hadapi Ketidakpastian']
            },
            {
                title: 'Prinsip Pareto',
                narration: 'Dua puluh persen usaha Anda sebenarnya menghasilkan delapan puluh persen dari seluruh hasil yang Anda dapatkan. Ini adalah Prinsip Pareto yang berlaku di hampir semua aspek kehidupan. Kuncinya bukan bekerja lebih keras, melainkan bekerja pada hal yang benar. Identifikasi tugas-tugas kritis yang memberikan dampak terbesar dan fokuslah pada strategi...',
                screenTexts: ['Prinsip Pareto', '80/20 Rule', 'Fokus Pada Hasil', 'Bekerja Secara Benar', 'Identifikasi Tugas Kritis', 'Efisiensi Adalah Eliminasi']
            }
        ]
    },
    {
        name: 'AI Animation',
        facts: [
            {
                title: 'Si Kucing Oranye Gemoy',
                narration: 'none',
                screenTexts: ['Kucing Oranye Gemoy', 'Petualangan Si Anabul', 'Makan Adalah Hidup', 'Tidur Adalah Hobi', 'Si Raja Rumah', 'Kucing AI Lucu'],
                visualKeywords: '3d animation fat orange cat funny cute'
            },
            {
                title: 'Kucing Oranye vs Ikan',
                narration: 'none',
                screenTexts: ['Mimpi Ikan Besar', 'Kucing Oranye Lapar', 'Dunia Bawah Air AI', 'Ikan Terbang Lucu', 'Kucing Bingung', 'Animasi AI Surreal'],
                visualKeywords: '3d animation fat orange cat fish surreal funny'
            },
            {
                title: 'Kucing Oranye di Luar Angkasa',
                narration: 'none',
                screenTexts: ['Astronot Kucing', 'Planet Makanan', 'Gravitasi Nol', 'Kucing Melayang', 'Bintang-Bintang Lucu', 'Petualangan Galaksi'],
                visualKeywords: '3d animation fat orange cat space astronaut funny'
            }
        ]
    }
];

export default async function generateContent() {
    let topic, fact;

    try {
        const customConceptsPath = path.join(process.cwd(), 'config', 'custom_concepts.json');
        const customData = await fs.readFile(customConceptsPath, 'utf-8');
        const customConcepts = JSON.parse(customData);

        if (customConcepts && customConcepts.length > 0) {
            const concept = customConcepts[Math.floor(Math.random() * customConcepts.length)];
            topic = { name: 'AI Animation' };
            fact = {
                title: concept.title,
                narration: 'none',
                screenTexts: concept.screenTexts,
                visualKeywords: concept.visualKeywords
            };
            console.log(`💡 Using custom concept: ${fact.title}`);
        }
    } catch (err) {
        // Fallback to hardcoded topics
    }

    if (!topic) {
        topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        fact = topic.facts[Math.floor(Math.random() * topic.facts.length)];
    }

    const contentDir = path.join(process.cwd(), 'paket_konten');
    await fs.mkdir(contentDir, { recursive: true });

    const files = await fs.readdir(contentDir);
    const count = files.filter(f => f.startsWith('paket_konten_')).length + 1;
    const filename = `paket_konten_${String(count).padStart(3, '0')}.md`;
    const filepath = path.join(contentDir, filename);

    // Masterpiece Style Markdown
    const content = `# PAKET KONTEN MASTERPIECE #${String(count).padStart(3, '0')}

## TOPIK
${fact.title} (${topic.name})

## SCRIPT NARASI
${fact.narration}

## TEKS LAYAR
${fact.screenTexts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## GAYA VISUAL
- Keywords: ${fact.visualKeywords || 'cinematic psychology'}

---

## DESKRIPSI VIDEO
${fact.narration === 'none' ? fact.screenTexts.join(', ') : fact.narration}

#fokus #psikologi #produktivitas #shorts #edukasi
`;

    await fs.writeFile(filepath, content, 'utf-8');
    return filepath;
}
