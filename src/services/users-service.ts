import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const usersService = {
  /**
   * Mendaftarkan pengguna baru (Register) ke dalam database.
   * Fungsi ini mengecek apakah email sudah digunakan, melakukan hashing pada password,
   * dan kemudian menyimpan data pengguna baru tersebut.
   * 
   * @param payload Objek yang berisi name, email, dan password untuk registrasi
   * @returns String "OKE" jika registrasi berhasil
   */
  async register(payload: any) {
    const { name, email, password } = payload;

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return "OKE";
  },

  /**
   * Melakukan otentikasi (Login) pengguna.
   * Fungsi ini mencari pengguna berdasarkan email, mencocokkan password dengan hash yang tersimpan,
   * lalu membuat sesi baru dengan token UUID dan menyimpannya di tabel sessions.
   * 
   * @param payload Objek yang berisi email dan password untuk login
   * @returns String berupa token sesi otentikasi
   */
  async login(payload: any) {
    const { email, password } = payload;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // Generate token
    const token = crypto.randomUUID();

    // Store session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  },

  /**
   * Mengambil data profil pengguna yang saat ini sedang login.
   * Pencarian dilakukan berdasarkan token sesi yang valid. Jika ditemukan, fungsi ini akan
   * mengembalikan detail pengguna tanpa menyertakan field password untuk alasan keamanan.
   * 
   * @param token Token otentikasi string dari sesi pengguna (Bearer Token)
   * @returns Objek data pengguna tanpa atribut password
   */
  async getCurrentUser(token: string) {
    // Step 1: Find session manually to avoid relation issues
    const sessionResult = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
    
    if (sessionResult.length === 0 || !sessionResult[0].userId) {
      throw new Error("Unauthorized");
    }

    const userId = sessionResult[0].userId;

    // Step 2: Find user by ID
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Melakukan proses logout dengan cara menghapus sesi otentikasi pengguna di database.
   * Token yang dikirimkan akan dicari pada tabel sessions lalu dihapus sehingga token tidak valid lagi.
   * 
   * @param token Token sesi otentikasi yang ingin dihapus (logout)
   * @returns String "OK" jika sesi berhasil dihapus
   */
  async logout(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return "OK";
  },
};
