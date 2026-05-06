import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ownerStatusEnum = pgEnum("owner_status", ["pending", "approved", "rejected"]);
export const ownerRoleEnum = pgEnum("owner_role", ["user", "admin"]);

export const ownersTable = pgTable("owners", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  phoneNumber: text("phone_number").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  telegramId: text("telegram_id").notNull(),
  areaOfStay: text("area_of_stay").notNull(),
  city: text("city"),
  occupation: text("occupation").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  evCarsOwned: text("ev_cars_owned").array().notNull().default([]),
  variantColor: text("variant_color").notNull(),
  otherCarModel: text("other_car_model"),
  purchaseMonthYear: text("purchase_month_year").notNull(),
  proofOfOwnershipUrl: text("proof_of_ownership_url"),
  status: ownerStatusEnum("status").notNull().default("pending"),
  role: ownerRoleEnum("role").notNull().default("user"),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  blogEnabled: boolean("blog_enabled").notNull().default(false),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOwnerSchema = createInsertSchema(ownersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOwner = z.infer<typeof insertOwnerSchema>;
export type Owner = typeof ownersTable.$inferSelect;
