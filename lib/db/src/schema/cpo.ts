import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cposTable = pgTable("cpos", {
  id: serial("id").primaryKey(),
  networkName: text("network_name").notNull(),
  contactPerson: text("contact_person"),
  designation: text("designation"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  city: text("city"),
  state: text("state"),
  address: text("address"),
  chargerTypes: text("charger_types").array().notNull().default([]),
  maxKw: real("max_kw"),
  operatingHours: text("operating_hours"),
  notes: text("notes"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCpoSchema = createInsertSchema(cposTable).omit({ id: true, createdAt: true });
export type InsertCpo = z.infer<typeof insertCpoSchema>;
export type Cpo = typeof cposTable.$inferSelect;
