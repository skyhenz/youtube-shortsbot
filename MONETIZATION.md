# Panduan Fitur Monetisasi YouTube Shorts Bot

Fitur ini memungkinkan rotasi otomatis Call-to-Action (CTA) di narasi penutup dan A/B testing deskripsi video untuk optimalisasi engagement dan konversi.

## 1. Konfigurasi CTA (Auto-Rotate)
CTA (ajakan bertindak) akan dipilih secara otomatis dari daftar dan ditambahkan **hanya** pada bagian akhir narasi (voice-over), tidak muncul di teks layar.

- **Lokasi File:** `config/cta_list.json`
- **Format:** Array string.
- **Cara Edit:** Tambahkan atau hapus kalimat di dalam tanda kutip.
- **Contoh:**
  ```json
  [
    "Follow untuk fakta psikologi lainnya.",
    "Klik link di bio untuk info lebih lanjut."
  ]
  ```

## 2. A/B Testing Deskripsi
Deskripsi video dipilih secara acak dari variasi yang tersedia untuk menguji performa (views/click-through).

- **Lokasi File:** `config/description_variants.json`
- **Format:** Array objek dengan `summary`, `hashtags`, dan `affiliatePlaceholder`.
- **Cara Edit:** Tambahkan objek baru ke dalam array.
- **Contoh:**
  ```json
  [
    {
      "summary": "Ringkasan video A...",
      "hashtags": ["#shorts", "#fakta"],
      "affiliatePlaceholder": "{{AFFILIATE_LINK}}"
    }
  ]
  ```

## 3. Logs & Analisa
Setiap kali video dibuat, bot mencatat kombinasi CTA dan Deskripsi yang digunakan untuk video tersebut.

- **Lokasi Log:** `logs/rotation.log`
- **Format Log:** JSON line per video.
  ```json
  {"timestamp":"...","videoId":"...","cta":"...","descriptionId":0}
  ```
- **Analisa:** Gunakan log ini untuk membandingkan performa video di YouTube Analytics berdasarkan variasi yang dipakai.

## 4. Mode Produksi
Pastikan file `.env` memiliki konfigurasi berikut agar bot langsung meng-upload video ke YouTube:

```ini
MODE_TEST=false
AUTO_UPLOAD=true
```

Jika `MODE_TEST=true`, video hanya akan disimpan di folder `output/` tanpa di-upload.
