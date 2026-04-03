import { mysqlTable, serial, text, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  email: varchar("email", { length: 255 }).unique(),
});
