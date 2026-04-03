import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Direct initialization with root user and no password as requested
const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "vibe_coding_db",
});

export const db = drizzle(connection, { schema, mode: "default" });
