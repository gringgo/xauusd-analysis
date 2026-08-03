import { pgTable, serial, varchar, text, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 50 }).notNull(),
  entryRange: varchar("entry_range", { length: 100 }).notNull(),
  entryPrice: real("entry_price").notNull(),
  tp: real("tp").notNull(),
  sl: real("sl").notNull(),
  status: varchar("status", { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, TP_HIT, SL_HIT
  signalTimestamp: timestamp("signal_timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 255 }).notNull(),
  bias: varchar("bias", { length: 255 }).notNull(),
  bos: varchar("bos", { length: 255 }).notNull(),
  fvg: varchar("fvg", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default('PENDING'),
  pipsWon: integer("pips_won").default(0),
  resultData: jsonb("result_data"),
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
  preNewsAnalysis: text("pre_news_analysis"), // Analisis 1 hari sebelum news
  analysis: text("analysis"),
  impact: varchar("impact", { length: 50 }).default('HIGH'), // HIGH, MED
  status: varchar("status", { length: 50 }).notNull().default('PENDING'), // BETUL, SALAH, PENDING
  pipsWon: integer("pips_won").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

