# Mobile Banking Automation

Framework Android native: **TypeScript → WebdriverIO Runner → Mocha → Appium → UiAutomator2 → Samsung real device**.

## Cakupan saat ini

`MBN-001 - Launch Mobile Banking` memverifikasi bahwa package
`com.dwidasa.bwk.mb.android` menjadi aplikasi foreground setelah Appium membukanya.
Test ini belum membuktikan layar login siap, backend tersedia, atau login berhasil.

Target yang diverifikasi pada 16 September 2026:

- Samsung SM-A556E, Android 16, UDID `RRCY205453P`.
- Launcher: `com.ccb.overseas.start.view.CcbSplashActivity`.
- Node `22.23.2`, npm `10.9.8`, WebdriverIO `9.31.9`.
- Appium `3.7.0`, UiAutomator2 `8.7.0`, TypeScript `5.9.3`.

## Menjalankan test

Jalankan perintah dari root proyek. Gunakan perangkat QA dengan aplikasi target
terpasang dan USB debugging diotorisasi. Tutup session Inspector sebelum run
agar satu perangkat tidak dikendalikan oleh dua session sekaligus.

1. Periksa koneksi dan server:

   ```sh
   adb devices -l
   curl http://127.0.0.1:4723/status
   ```

2. Bila server belum berjalan, buka terminal terpisah dan jalankan:

   ```sh
   export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
   export ANDROID_HOME="/Users/muzak/Library/Android/sdk"
   appium --address 127.0.0.1 --port 4723
   ```

   Server dijalankan **secara eksternal**. `services: []` membuat runner terhubung
   ke server tersebut tanpa mencoba menyalakan server lain pada port yang sama.
   Instalasi Java, Android SDK, Appium, dan driver yang sudah bekerja tetap dipakai.

3. Periksa tipe dan jalankan MBN-001:

   ```sh
   npm run typecheck
   npm run test:launch
   ```

   `npm test` menjalankan semua `test/specs/**/*.spec.ts`; saat ini hanya MBN-001.
   Script lama `npm run wdio` juga tetap tersedia.
   Untuk memasang dependency pada checkout baru, gunakan `npm ci` dari lockfile.

## File dan tanggung jawab

- `wdio.conf.ts`: endpoint Appium, satu worker, capabilities perangkat, pemilihan
  spec, timeout, Mocha, dan Spec Reporter.
- `test/config/android-target.ts`: identitas perangkat, package, dan launcher
  terverifikasi agar config dan spec memakai target yang konsisten.
- `test/specs/launch.spec.ts`: suite dan assertion MBN-001.
- `tsconfig.json`: konfigurasi TypeScript strict yang sudah ada tetap digunakan.
- `package.json` / `package-lock.json`: command serta dependency. TypeScript,
  tsx, dan WebdriverIO dideklarasikan langsung dengan versi pasti.
- `.gitignore`: mengabaikan dependency, secret lokal, log, dan bukti eksekusi baru.

`test/first-test.ts` tetap menjadi contoh standalone; perubahan lokal pengguna
dipertahankan. `test/specs/test.e2e.ts` dan page objects yang sudah ada adalah
contoh login web Heroku bawaan generator, bukan implementasi login mobile banking.
Pola `*.spec.ts` membuat contoh tersebut tidak ikut dijalankan. Akun yang ada di
contoh itu adalah akun demo publik; jangan menggantinya dengan kredensial banking.
Dependency service Appium/visual dan type declarations lamanya masih tersimpan,
tetapi servicenya tidak diaktifkan untuk MBN-001.

## Cara framework bekerja

1. WDIO membaca config dan memilih spec.
2. Runner membuat session Appium. Capabilities menentukan perangkat, driver,
   package, dan launcher yang dibuka. `maxInstances: 1` mencegah worker paralel
   berebut satu perangkat dalam run ini.
3. Mocha menjalankan suite dan test. `describe()` mengelompokkan skenario;
   `it()` mendefinisikan satu test case, termasuk ID literal `MBN-001`.
4. `browser.waitUntil()` memeriksa package setiap 500 ms, maksimal 15 detik.
   Ia selesai segera setelah kondisi terpenuhi, berbeda dengan jeda tetap yang
   tetap menunggu meskipun aplikasi sudah siap.
5. `expect(currentPackage).toBe(expectedPackage)` membandingkan hasil aktual
   dengan package yang diharapkan. Ketidaksesuaian, timeout, atau error command
   membuat test gagal. Tidak ada pesan console yang dapat menetapkan PASS sendiri.
6. Adapter Mocha meneruskan hasil ke WDIO. Spec Reporter menerima event hasil
   untuk menampilkan suite, ID, PASS/FAIL, durasi, dan detail error. Durasi reporter
   saat ini merupakan durasi suite/run, bukan pengukuran performa startup aplikasi.
7. Runner menutup session; spec tidak perlu memanggil `remote()` atau `deleteSession()`.

`async/await` memastikan test menunggu respons perangkat. Lupa `await` dapat
membuat test selesai sebelum command/assertion selesai dan menyamarkan kegagalan.
Hook `before()` / `after()` nantinya berguna untuk persiapan/pembersihan skenario;
saat ini belum diperlukan karena lifecycle session sudah dikelola runner.

`tsx` menjalankan TypeScript, sedangkan `tsc --noEmit` memeriksa tipe tanpa
menghasilkan JavaScript. Test yang bisa berjalan belum tentu bebas kesalahan tipe;
itulah alasan tersedia command `typecheck` terpisah.

## Launcher dan state aplikasi

Launcher ditemukan dengan:

```sh
adb -s RRCY205453P shell cmd package resolve-activity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER --brief com.dwidasa.bwk.mb.android
adb -s RRCY205453P shell am start -W -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -n com.dwidasa.bwk.mb.android/com.ccb.overseas.start.view.CcbSplashActivity
```

Validasi ADB menghasilkan `Status: ok`. `HKHomeActivity` hanya dimasukkan sebagai
activity yang boleh muncul saat menunggu perpindahan dari splash; activity internal
itu tidak dipakai sebagai launcher.

`noReset: true` mempertahankan data aplikasi, termasuk kemungkinan session login
atau device binding. `forceAppLaunch: true` tetap me-restart aplikasi pada awal
session untuk menguji launch. Kombinasi ini tidak menjamin state logout.

## Debugging dan langkah berikutnya

- Bila koneksi ditolak: periksa status server/port Appium terlebih dahulu.
- Bila session gagal dibuat: periksa log Appium, status ADB, UDID, dan launcher.
- Bila MBN-001 timeout: periksa package/activity foreground dan kondisi perangkat.
  Screenshot otomatis belum diaktifkan pada fase ini.
- Perubahan lokal di `first-test.ts` telah menghapus launcher internal yang salah;
  jangan mengembalikan `HKHomeActivity` menjadi `appActivity`.

Repository saat inspeksi masih melacak 26.721 file dalam `node_modules`.
`.gitignore` tidak menghentikan pelacakan file yang sudah masuk Git; akibatnya
metadata `node_modules/.package-lock.json` ikut terlihat berubah setelah instalasi.
Pembersihan indeks Git perlu dikerjakan terpisah dari migrasi runner ini.

Berikutnya: sepakati akun QA dan state awal login, inspeksi locator stabil di layar
login, lalu implementasikan `MBN-002` serta Page Object ketika sudah ada beberapa
interaksi pada layar. Kredensial harus berasal dari environment/secrets. Login,
Allure, screenshot otomatis, dan Appium MCP belum diimplementasikan.

Referensi: [WDIO TypeScript](https://webdriver.io/docs/typescript/),
[Spec Reporter](https://webdriver.io/docs/spec-reporter/),
[UiAutomator2 capabilities](https://github.com/appium/appium-uiautomator2-driver#capabilities).
