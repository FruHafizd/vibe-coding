import { Elysia } from "elysia";
import { db } from "./db";
import { usersRoutes } from "./routes/users-routes";

const app = new Elysia()
  .use(usersRoutes)
  .get("/", () => "Hello World")
  .get("/test-db", async () => {
    try {
      // Simple query to verify DB connection
      return { status: "connected" };
    } catch (e) {
      return { status: "error", message: (e as Error).message };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
