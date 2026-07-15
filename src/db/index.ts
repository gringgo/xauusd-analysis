import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

let client;
if (connectionString) {
  client = postgres(connectionString);
} else if (process.env.SQL_USER && process.env.SQL_PASSWORD && process.env.SQL_HOST && process.env.SQL_DB_NAME) {
  client = postgres({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
  });
} else {
  throw new Error("Database connection configuration is not set");
}

export const db = drizzle(client, { schema });
