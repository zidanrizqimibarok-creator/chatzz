# Chatzz Messenger

A nostalgic retro BBM (BlackBerry Messenger) and Windows Live Messenger inspired instant messaging application built with React 18, TypeScript, Vite, and Tailwind CSS.

## Fitur Utama & Pembaruan

1. **Bilah Pencarian di Bagian Teratas (Top Search Bar)**:
   - Input pencarian terletak di bagian paling atas `ContactsScreen` untuk menyaring kontak secara real-time berdasarkan Nama maupun PIN dengan tombol bersihkan instan.
2. **Pemindai & Generator QR Multi-Mode (QR Scanner & Generator)**:
   - **QR Saya**: Menampilkan kode matriks resolusi tinggi dengan kartu identitas PIN Chatzz.
   - **Pindai Kamera Langsung**: Mengakses sensor kamera secara live dengan viewfinder target pemindaian.
   - **Unggah Gambar QR**: Deteksi dan baca gambar/screenshot barcode dari galeri file.
   - **Uji Coba & Tambah Otomatis**: Mendeteksi PIN teman dan langsung menawarkan tombol "Tambah Kontak Sekarang".
3. **Pesan Siaran Massal (Broadcast / BC)**:
   - Kirim pesan siaran serentak ke seluruh kontak aktif dengan badge ungu `[BC]`.
4. **Perekam & Pemutar Pesan Suara (Voice Note / Walkie-Talkie)**:
   - Rekam audio dengan visualizer waktu, waveform retro, dan pemutar audio inline.
5. **Reaksi Emoji Pesan (Message Reactions)**:
   - Beri reaksi emoji (❤️, 👍, 😂, 😮, 😢, 🔥, 👏, 🎉) dengan klik hover atau tekan lama (long-press).
6. **Tarik Pesan untuk Semua Orang (Unsend / Delete for Everyone)**:
   - Tarik pesan terkirim secara serentak via MQTT atau hapus dari riwayat lokal sendiri.
7. **Wallpaper Obrolan Retro (Chat Wallpaper)**:
   - Pilih latar belakang obrolan dari 8 preset retro (Aero Blue Klasik, BBM Pinstripes, 90s Cyber Grid, BlackBerry Carbon, Aqua Water Bubbles, Matrix Code Dark, Vintage Paper, Y2K Pink) dengan penyimpanan preferensi per-kontak dan preview visual langsung.
8. **Indikator Sedang Mengetik (Live Typing Indicator)**:
   - Animasi pulsa titik-titik saat lawan bicara sedang mengetik pesan secara real-time.
9. **Keterangan Foto (Photo Caption)**:
   - Lampirkan pesan teks/keterangan sebelum foto dikirim.
9. **Balasan Kilat (Quick Canned Replies)**:
   - Tombol kilat untuk mengirim template obrolan cepat (misal: "Lagi OTW", "Siap bro!").
10. **BBM Groups (Obrolan Grup Multi-Kontak)**:
    - Buat ruang obrolan grup dengan nama dan anggota kontak pilihan.
11. **BBM Music / Status Musik (Now Playing)**:
    - Pasang status lagu yang sedang didengarkan dengan pilihan preset lagu nostalgia.
12. **Galeri Avatar Retro (Retro Avatars)**:
    - Pilihan avatar 8-bit bot, pixel cat, cyber ninja, retro gamer, dan lainnya.
13. **Pilihan Nada Dering & Notifikasi (Retro Notification Sounds)**:
    - BBM Ping klasik, MSN Nudge buzz, ICQ Uh-Oh, Crystal Chime, dan Water Bubble.
14. **Kunci Sandi Aplikasi (4-Digit Passcode Lock)**:
    - Amankan aplikasi Chatzz dengan PIN angka 4 digit saat pertama kali dibuka.
15. **Kontak Favorit (Pinned Contacts)**:
    - Sematkan kontak favorit ke bagian teratas daftar kontak dengan ikon pin emas.
16. **Pencarian Riwayat & Pesan Berbintang (Starred Messages)**:
    - Cari kata kunci dalam percakapan dan simpan pesan penting dengan bintang.
17. **Pengatur Ukuran Huruf Chat (Chat Font Scaler)**:
    - Pilihan ukuran teks pesan: Kecil, Sedang, dan Besar (A- / A+).
18. **Ekspor Riwayat Chat ke File TXT**:
    - Unduh seluruh transkrip percakapan beserta waktu ke file teks.
19. **Statistik Penggunaan Chatzz (Chatzz Analytics)**:
    - Total pesan terkirim, PING buzzer, pesan suara, dan ringkasan koneksi MQTT.
20. **Pilihan Tema Jelly**:
    - Aero Blue (Klasik), Berry Purple, Matrix Emerald, Crimson Ruby, dan Obsidian Dark.
21. **Salin Teks Pesan Cepat**:
    - Tombol salin teks pesan ke clipboard.
22. **Panggilan Suara WebRTC P2P**:
    - Telepon suara real-time dengan STUN Google, mute mic, dan volume speaker.

## Menjalankan Aplikasi

```bash
npm install
npm run dev
```
