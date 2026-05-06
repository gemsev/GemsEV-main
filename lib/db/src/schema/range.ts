import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evRangeSpecsTable = pgTable("ev_range_specs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  batteryCapacityKwh: real("battery_capacity_kwh").notNull(),
  wltpRangeKm: integer("wltp_range_km").notNull(),
  realWorldRangeKm: integer("real_world_range_km").notNull(),
  chargingSpeedKw: real("charging_speed_kw"),
  consumptionWh100km: real("consumption_wh_100km"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEvRangeSpecSchema = createInsertSchema(evRangeSpecsTable).omit({ id: true, createdAt: true });
export type InsertEvRangeSpec = z.infer<typeof insertEvRangeSpecSchema>;
export type EvRangeSpec = typeof evRangeSpecsTable.$inferSelect;
