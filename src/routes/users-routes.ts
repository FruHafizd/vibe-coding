import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";
import { auth } from "../middlewares/auth-middleware";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body }) => {
    const data = await usersService.register(body);
    return { data };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String(),
    })
  })
  .post("/login", async ({ body }) => {
    const data = await usersService.login(body);
    return { data };
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    })
  })
  .use(auth)
  .get("/current", async ({ token }) => {
    if (!token) throw new Error("Unauthorized");
    
    const data = await usersService.getCurrentUser(token);
    return { data };
  })
  .delete("/logout", async ({ token }) => {
    if (!token) throw new Error("Unauthorized");

    await usersService.logout(token);
    return { data: "OK" };
  });
