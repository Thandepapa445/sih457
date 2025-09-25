import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const faultReportStatusEnum = z.enum([
  "pending",
  "approved", 
  "assigned",
  "rejected"
]);

export type FaultReportStatus = z.infer<typeof faultReportStatusEnum>;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const faultReports = sqliteTable("fault_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  department: text("department"),
  location: text("location"),
  reportedBy: text("reported_by"),
  status: text("status").notNull().default("pending"),
  attachments: text("attachments"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const insertFaultReportSchema = createInsertSchema(faultReports).omit({
  id: true,
  status: true,
  attachments: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFaultReport = z.infer<typeof insertFaultReportSchema>;
export type FaultReport = typeof faultReports.$inferSelect;

export const updateFaultReportStatusSchema = z.object({
  status: faultReportStatusEnum
});

export const updateFaultReportSchema = insertFaultReportSchema.partial();

export type UpdateFaultReportStatus = z.infer<typeof updateFaultReportStatusSchema>;
export type UpdateFaultReport = z.infer<typeof updateFaultReportSchema>;
