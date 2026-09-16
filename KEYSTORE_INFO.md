# Informasi Signature Key (Keystore) & Build Android LovyChat

File signature key (release keystore) telah berhasil dibuat dan dikonfigurasi untuk aplikasi **LovyChat**.

---

## 1. Detail Signature Key (Keystore)

| Parameter | Nilai |
| :--- | :--- |
| **Nama File Keystore** | `release.keystore` (tersimpan di `android/app/release.keystore`) |
| **Keystore Password (Storepass)** | `lovychat123` |
| **Key Alias** | `lovychat` |
| **Key Password** | `lovychat123` |
| **Algoritma & Ukuran** | RSA 2048-bit (valid 10.000 hari) |
| **Tipe Keystore** | PKCS#12 (Standar industri Android & Google Play) |

> 💡 **PENTING**: Simpan file `release.keystore` dan password di atas dengan aman. Google Play Store memerlukan signature key yang sama persis setiap kali Anda merilis update aplikasi di kemudian hari.

---

## 2. GitHub Secrets yang Dibutuhkan

Di repository GitHub Anda (**Settings** ➔ **Secrets and variables** ➔ **Actions**), pastikan secret berikut sudah ada:

1. `SUPABASE_URL`: URL project Supabase Anda (`https://xxx.supabase.co`).
2. `SUPABASE_ANON_KEY`: Anon Public Key Supabase (`eyJhbGci...`).
3. *(Opsional)* `ANDROID_KEYSTORE_BASE64`: Isi dari file `keystore_base64.txt`. Jika secret ini diisi, GitHub Action akan menggunakannya. Jika tidak diisi, GitHub Action akan otomatis menggunakan file `android/app/release.keystore` yang sudah ada di repository.
4. *(Opsional)* `KEYSTORE_PASSWORD`: `lovychat123`
5. *(Opsional)* `KEY_ALIAS`: `lovychat`
6. *(Opsional)* `KEY_PASSWORD`: `lovychat123`

---

## 3. Cara Menjalankan Build di GitHub Actions

1. Buka tab **Actions** di repository GitHub Anda.
2. Pilih workflow **Build Android APK & PlayStore AAB** di panel sebelah kiri.
3. Klik tombol **Run workflow** ➔ Pilih branch `main` ➔ Klik **Run workflow**.
4. GitHub Actions akan otomatis:
   - Meng-install dependencies
   - Meng-generate ikon aplikasi resmi LovyChat dan splash screen
   - Mem-build aset web React & Supabase
   - Menyelaraskan Capacitor Android (`npx cap sync android`)
   - Menandatangani (*sign*) dengan keystore rilis
   - Menghasilkan:
     - 📱 **`LovyChat-Release-APK`**: File `.apk` yang sudah di-sign dan siap diinstall langsung di HP Android Anda.
     - 🚀 **`LovyChat-PlayStore-AAB`**: File `.aab` (Android App Bundle) yang sudah di-sign dan siap diupload ke **Google Play Console**.

---

## 4. Izin Aplikasi (Permissions) yang Sudah Aktif

Di file `android/app/src/main/AndroidManifest.xml`, semua izin telah dipasang lengkap:

* ✅ **Internet & Jaringan**: `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`
* ✅ **GPS & Geolocation**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (untuk fitur Teman di Sekitar)
* ✅ **Kamera & Audio**: `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` (untuk foto chat, avatar, dan rekaman pesan suara)
* ✅ **Galeri & Media**: `READ_MEDIA_IMAGES`, `READ_MEDIA_AUDIO`, `READ_MEDIA_VIDEO`, `READ_EXTERNAL_STORAGE`
* ✅ **Notifikasi & Getar**: `POST_NOTIFICATIONS`, `VIBRATE`
* ✅ **Traffic Aman & Akselerasi**: `android:usesCleartextTraffic="true"`, `android:hardwareAccelerated="true"`
