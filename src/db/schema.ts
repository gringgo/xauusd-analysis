import { pgTable, serial, varchar, text, integer, timestamp } from "drizzle-orm/pg-core";

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 255 }).notNull(),
  bias: varchar("bias", { length: 255 }).notNull(),
  bos: varchar("bos", { length: 255 }).notNull(),
  fvg: varchar("fvg", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highImpactNews = pgTable("high_impact_news", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull().default('OTHER'), // NFP, FOMC, CPI, PPI, RETAIL_SALES, OTHER
  date: varchar("date", { length: 255 }).notNull(),
  forecast: varchar("forecast", { length: 100 }),
  previous: varchar("previous", { length: 100 }),
  actual: varchar("actual", { length: 100 }),
  prediction: varchar("prediction", { length: 50 }).notNull(), // BULLISH, BEARISH, NEUTRAL
  analysis: text("analysis"),
  status: varchar("status", { length: 50 }).notNull().default('PENDING'), // BETUL, SALAH, PENDING
  pipsWon: integer("pips_won").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

