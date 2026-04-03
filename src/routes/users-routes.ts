import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    try {
      const data = await usersService.register(body);
      return { data };
    } catch (error: any) {
      if (error.message === "Email sudah terdaftar") {
        set.status = 400;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String(),
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const data = await usersService.login(body);
      return { data };
    } catch (error: any) {
      if (error.message === "Email atau password salah") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    })
  })
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const data = await usersService.getCurrentUser(token);
      return { data };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  });
