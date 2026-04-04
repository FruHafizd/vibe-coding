
Aplikasi ini adalah sebuah aplikasi backend API untuk manajemen pengguna (user management) dan autentikasi yang dibangun di atas ekosistem JavaScript modern dengan performa tinggi. Aplikasi ini mengelola siklus dari pendaftaran pengguna (registrasi), login (sistem berbasis token/session-based pada database), dan manajemen profil dasar.

## 🚀 Technology Stack & Libraries

Proyek ini dibangun menggunakan teknologi berikut:
- **Runtime:** [Bun](https://bun.com) - Javascript runtime yang sangat cepat dan *all-in-one*.
- **Framework API:** [ElysiaJS](https://elysiajs.com/) - Framework web backend yang cepat dan bersahabat dengan TypeScript.
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) - ORM TypeScript yang ringan dan *type-safe*.
- **Database Driver:** MySQL (melalui library `mysql2`).
- **Keamanan:** `bcryptjs` untuk *hashing* password secara aman.

## 📁 Arsitektur dan Struktur Folder

Aplikasi ini menggunakan pola arsitektur *Layered Architecture* yang memisahkan antara *routing API*, logika bisnis (layanan), dan interaksi dengan database.

```text
d:/Project/VibeEngginer/
├── package.json         # Konfigurasi dependensi project dan script bun
├── src/
│   ├── index.ts         # Entry point aplikasi (Elysia app setup, global error handler)
│   ├── db/
│   │   └── schema.ts    # Definisi skema tabel database untuk Drizzle ORM
│   ├── middlewares/
│   │   └── auth-middleware.ts  # Middleware otorisasi (mengekstrak dan memvalidasi token)
│   ├── routes/
│   │   └── users-routes.ts     # Definisi endpoint (controller) dan validasi input dengan Typebox
│   └── services/
│       └── users-service.ts    # Logika bisnis utama (validasi data, hashing password, pemanggilan query DB)
```

## 🗄️ Database Schema

Skema database terdiri dari dua tabel utama yang saling berelasi:

1. **`users`**
   - `id` (INT) - *Primary Key* (Serial)
   - `name` (VARCHAR 255)
   - `email` (VARCHAR 255) - *Unique*
   - `password` (VARCHAR 255) - *Hashed*
   - `created_at` (TIMESTAMP)

2. **`sessions`**
   - `id` (INT) - *Primary Key* (Serial)
   - `token` (VARCHAR 255) - Token unik untuk keperluan autentikasi login
   - `user_id` (INT) - *Foreign Key* ke tabel `users`
   - `created_at` (TIMESTAMP)

> Relasi: Setiap `user` dapat memiliki banyak `sessions` (*One-to-Many*), yang memungkinkan mereka masuk dari berbagai perangkat secara bersamaan.

## 📡 API yang Tersedia

Berikut adalah daftar endpoint API yang tersedia (Base URL: `http://localhost:3000`):

### Public Endpoints
- **`GET /`** : Endpoint *testing* sederhana, mengembalikan pesan `"Hello World"`.
- **`GET /test-db`** : Endpoint untuk mengecek status koneksi aplikasi ke database.
- **`POST /api/users`** : Registrasi akun pengguna baru.
  - **Body JSON:** `{ "name": "...", "email": "...", "password": "..." }`
- **`POST /api/users/login`** : Login pengguna dan mendapatkan token otentikasi.
  - **Body JSON:** `{ "email": "...", "password": "..." }`

### Protected Endpoints (Membutuhkan Otorisasi)
Endpoint di bawah ini mewajibkan Anda untuk mengirim header Authorization berisikan token yang didapatkan dari login.
- **`GET /api/users/current`** : Mendapatkan kelengkapan data *profile user* yang saat ini sedang login sesuai token yang diberikan.
- **`DELETE /api/users/logout`** : Mengakhiri sesi pengguna (*logout*) dan menghapus token dari record database.

## 🛠️ Cara Setup Project

1. Pastikan Anda telah menginstal lingkungan [Bun](https://bun.com/).
2. Clone repository ini ke mesin lokal Anda.
3. Install seluruh dependensi (*libraries*) yang dibutuhkan dengan perintah:

   ```bash
   bun install
   ```

4. Konfigurasikan file env atau kredensial database untuk terhubung dengan server MySQL (*pastikan database MySQL sudah berjalan di komputer lokal atau server Anda*).

## 🏃‍♂️ Cara Menjalankan Aplikasi

Untuk menjalankan server API:

```bash
bun run src/index.ts
```

Secara default, aplikasi akan berjalan dan menerima *request* di **localhost** port **3000**.
Jika berhasil, terminal akan menampilkan log: `🦊 Elysia is running at localhost:3000`.

## 🧪 Cara Test Aplikasi

Karena belum ada skrip *automated testing* e.g., `bun test` pada tahapan ini, Anda bisa mengujinya melalui **Manual API Testing** dengan alat *HTTP Client* seperti:
- **Postman** atau **Insomnia**.
- Ekstensi *VSCode* semacam **REST Client** atau **Thunder Client**.
- Jalankan aplikasi (`bun run src/index.ts`), kemudian arahkan HTTP Request ke `http://localhost:3000` sesuai dengan *URL path* dan spesifikasi HTTP *Method* dari dokumentasi API di atas.
