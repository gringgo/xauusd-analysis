import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 255 }).notNull(),
  bias: varchar("bias", { length: 255 }).notNull(),
  bos: varchar("bos", { length: 255 }).notNull(),
  fvg: varchar("fvg", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
