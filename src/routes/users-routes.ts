import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";
import { auth } from "../middlewares/auth-middleware";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body }) => {
    const data = await usersService.register(body);
    return { data };
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ maxLength: 255 }),
    }),
    response: t.Object({
      data: t.String()
    }),
    detail: {
      summary: "Registrasi Pengguna Baru",
      tags: ["Users"],
      description: "Mendaftarkan user baru ke sistem."
    }
  })
  .post("/login", async ({ body }) => {
    const data = await usersService.login(body);
    return { data };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    }),
    response: t.Object({
      data: t.String()
    }),
    detail: {
      summary: "Login Pengguna",
      tags: ["Users"],
      description: "Melakukan autentikasi dan mendapatkan token."
    }
  })
  .use(auth)
  .get("/current", async ({ token }) => {
    if (!token) throw new Error("Unauthorized");

    const data = await usersService.getCurrentUser(token);
    return { data };
  }, {
    response: t.Object({
      data: t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        createdAt: t.Nullable(t.Date())
      })
    }),
    detail: {
      summary: "Ambil Profil Saat Ini",
      tags: ["Users"],
      description: "Mendapatkan data pengguna berdasarkan token sesi.",
      security: [{ bearerAuth: [] }]
    }
  })
  .delete("/logout", async ({ token }) => {
    if (!token) throw new Error("Unauthorized");

    await usersService.logout(token);
    return { data: "OK" };
  }, {
    response: t.Object({
      data: t.String()
    }),
    detail: {
      summary: "Logout Sesi",
      tags: ["Users"],
      description: "Menghapus sesi aktif.",
      security: [{ bearerAuth: [] }]
    }
  });
