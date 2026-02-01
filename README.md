# YouTube Shorts Automation Bot - Psychology Niche

Automated YouTube Shorts video generator and uploader focused on **Psychology & Human Behavior** content.

## Features

- 🧠 **Psychology Niche Content**: Accurate, safe, research-backed facts
- 🎥 **Automated Video Generation**: TTS + Text overlays
- 📤 **Auto Upload to YouTube**: GitHub Actions scheduling
- 🛡️ **Production Hardened**: Validation, rate limits, quota protection
- 🔒 **Copyright Safe**: Text-only, no stock footage
- 📊 **Health Monitoring**: Comprehensive logging system
- 🧪 **Test Mode**: Safe testing without uploads

## Content Packages

- `paket_konten_001.md` - 3 Fakta Menarik Tentang Air
- `paket_konten_002.md` - [Topic 2]
- `paket_konten_003.md` - 3 Fakta Menarik Tentang Otak Manusia ✨
- `paket_konten_004.md` - 3 Fakta Psikologi Tentang Kebahagiaan ✨
- `paket_konten_005.md` - 3 Fakta Psikologi Tentang Memori ✨

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
