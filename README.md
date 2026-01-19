# YouTube Shorts Automation Bot

Bot otomatis untuk menghasilkan dan upload video YouTube Shorts dari paket konten.

## Fitur

- ✅ Baca paket konten dari file markdown
- ✅ Generate audio TTS bahasa Indonesia
- ✅ Buat video vertikal 9:16 dengan FFmpeg
- ✅ Upload otomatis ke YouTube
- ✅ Jadwal upload setiap 8 jam (07:00, 15:00, 23:00 WIB)
- ✅ Tidak perlu PC menyala 24 jam (pakai GitHub Actions)

## Instalasi

1. Clone repository
```bash
cd d:\react\bot yt
```

2. Install dependencies
```bash
npm install
```

3. Setup environment
```bash
cp .env.example .env
```

4. Edit `.env` dengan kredensial YouTube API Anda

## Cara Mendapatkan YouTube API

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru
3. Aktifkan YouTube Data API v3
4. Buat OAuth 2.0 credentials
5. Download client_secret.json
6. Jalankan OAuth flow untuk mendapat refresh_token

## Struktur Folder

```
bot-yt/
├── config/
│   └── config.js
├── scripts/
│   ├── generate_script.js
│   ├── generate_voice.js
│   ├── generate_video.js
│   ├── upload_youtube.js
│   └── cleanup.js
├── paket_konten/
│   ├── paket_konten_001.md
│   └── paket_konten_002.md
├── output/
├── logs/
├── .github/
│   └── workflows/
│       └── auto-upload.yml
├── index.js
├── package.json
└── .env
```

## Cara Pakai

### Local
```bash
npm start
```

### GitHub Actions (Otomatis)

1. Push code ke GitHub
2. Tambahkan secrets di repository settings:
   - `YOUTUBE_API_KEY`
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`
   - `YOUTUBE_CHANNEL_ID`

3. Bot akan jalan otomatis setiap 8 jam

## Format Paket Konten

Buat file `paket_konten_XXX.md` dengan format:

```markdown
## TOPIK
Judul topik

## SCRIPT NARASI
Teks narasi lengkap

## TEKS LAYAR
1. Teks 1
2. Teks 2
...

## GAYA VISUAL
Gradasi (#000000 ke #111111)
...
```

## Troubleshooting

- **FFmpeg not found**: Install FFmpeg
- **YouTube quota exceeded**: Tunggu reset quota (biasanya 24 jam)
- **Upload failed**: Cek kredensial YouTube API

## License

ISC
