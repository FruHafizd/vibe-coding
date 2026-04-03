// Main entry point for the ElysiaJS server
import { Elysia } from "elysia";
import { db } from "./db";

const app = new Elysia()
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
