import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fireDetections = pgTable("fire_detections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  confidence: real("confidence").notNull(),
  riskLevel: text("risk_level").notNull(), // EXTREME, HIGH, MODERATE, LOW
  detectedAt: timestamp("detected_at").defaultNow(),
  weatherData: jsonb("weather_data"),
  spreadPrediction: jsonb("spread_prediction"),
  notificationsSent: boolean("notifications_sent").default(false),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  windDirection: text("wind_direction").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const emergencyNotifications = pgTable("emergency_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fireDetectionId: varchar("fire_detection_id").references(() => fireDetections.id),
  agency: text("agency").notNull(),
  status: text("status").notNull(), // SENT, DELIVERED, FAILED
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertFireDetectionSchema = createInsertSchema(fireDetections).omit({
  id: true,
  detectedAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
});

export const insertEmergencyNotificationSchema = createInsertSchema(emergencyNotifications).omit({
  id: true,
  sentAt: true,
});

export type FireDetection = typeof fireDetections.$inferSelect;
export type InsertFireDetection = z.infer<typeof insertFireDetectionSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type EmergencyNotification = typeof emergencyNotifications.$inferSelect;
export type InsertEmergencyNotification = z.infer<typeof insertEmergencyNotificationSchema>;
