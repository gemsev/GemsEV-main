import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accessoriesTable = pgTable("accessories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  compatibleCars: text("compatible_cars").array().notNull().default([]),
  sellerName: text("seller_name").notNull(),
  sellerContact: text("seller_contact"),
  sellerUrl: text("seller_url"),
  location: text("location"),
  priceRange: text("price_range"),
  imageUrl: text("image_url"),
  rating: real("rating"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAccessorySchema = createInsertSchema(accessoriesTable).omit({ id: true, createdAt: true });
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
export type Accessory = typeof accessoriesTable.$inferSelect;
