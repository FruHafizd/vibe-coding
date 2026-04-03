import { Elysia } from "elysia";
import { usersRoutes } from "./routes/users-routes";

const app = new Elysia()
  .onError(({ code, error, set }) => {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "Unauthorized") {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    if (message === "Email atau password salah") {
      set.status = 401;
      return { error: "Email atau password salah" };
    }

    if (message === "Email sudah terdaftar") {
      set.status = 400;
      return { error: "Email sudah terdaftar" };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not Found" };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation Error", details: (error as any).all };
    }

    console.error(error);
    set.status = 500;
    return { error: "Internal Server Error" };
  })
  .use(usersRoutes)
  .get("/", () => "Hello World")
  .get("/test-db", async () => {
    return { status: "connected" };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
