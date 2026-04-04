import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("User API Tests", () => {
  beforeEach(async () => {
    // Clear sessions first to avoid foreign key issues
    await db.delete(sessions);
    await db.delete(users);
  });

  const baseUrl = "http://localhost/api/users";

  describe("POST /api/users (Registration)", () => {
    it("should register a new user successfully", async () => {
      const payload = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const response = await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.data).toBe("OKE");
    });

    it("should fail registration with invalid email format", async () => {
      const payload = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      };

      const response = await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Validation Error");
    });

    it("should fail registration when email is already registered", async () => {
      const payload = {
        name: "User 1",
        email: "dual@example.com",
        password: "password123",
      };

      // First registration
      await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Email sudah terdaftar");
    });

    it("should fail registration with name longer than 255 characters", async () => {
      const payload = {
        name: "A".repeat(256),
        email: "long@example.com",
        password: "password123",
      };

      const response = await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Validation Error");
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create user for login tests
      await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.data).toBeDefined(); // Token
      expect(typeof json.data).toBe("string");
    });

    it("should fail login with wrong password", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "john@example.com",
            password: "wrong-password",
          }),
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Email atau password salah");
    });
  });

  describe("Authorized Endpoints", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get token
      await app.handle(
        new Request(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Auth User",
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request(`${baseUrl}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );
      const loginData = await loginRes.json();
      token = loginData.data;
    });

    it("should get current user profile with valid token", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/current`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.email).toBe("auth@example.com");
      expect(json.data.password).toBeUndefined();
    });

    it("should fail getting current user without token", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/current`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should logout successfully", async () => {
      const response = await app.handle(
        new Request(`${baseUrl}/logout`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      expect((await response.json()).data).toBe("OK");

      // Verify token is no longer valid
      const secondCheck = await app.handle(
        new Request(`${baseUrl}/current`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(secondCheck.status).toBe(401);
    });
  });
});
