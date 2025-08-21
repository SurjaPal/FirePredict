import { type FireDetection, type InsertFireDetection, type WeatherData, type InsertWeatherData, type EmergencyNotification, type InsertEmergencyNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Fire Detection methods
  createFireDetection(detection: InsertFireDetection): Promise<FireDetection>;
  getFireDetection(id: string): Promise<FireDetection | undefined>;
  getAllFireDetections(): Promise<FireDetection[]>;
  updateFireDetection(id: string, updates: Partial<FireDetection>): Promise<FireDetection | undefined>;

  // Weather Data methods
  createWeatherData(weather: InsertWeatherData): Promise<WeatherData>;
  getLatestWeatherData(latitude: number, longitude: number): Promise<WeatherData | undefined>;
  
  // Emergency Notification methods
  createEmergencyNotification(notification: InsertEmergencyNotification): Promise<EmergencyNotification>;
  getNotificationsByFireId(fireDetectionId: string): Promise<EmergencyNotification[]>;
}

export class MemStorage implements IStorage {
  private fireDetections: Map<string, FireDetection>;
  private weatherData: Map<string, WeatherData>;
  private emergencyNotifications: Map<string, EmergencyNotification>;

  constructor() {
    this.fireDetections = new Map();
    this.weatherData = new Map();
    this.emergencyNotifications = new Map();
  }

  async createFireDetection(detection: InsertFireDetection): Promise<FireDetection> {
    const id = randomUUID();
    const fireDetection: FireDetection = {
      ...detection,
      id,
      detectedAt: new Date(),
      notificationsSent: false,
      weatherData: detection.weatherData || null,
      spreadPrediction: detection.spreadPrediction || null,
    };
    this.fireDetections.set(id, fireDetection);
    return fireDetection;
  }

  async getFireDetection(id: string): Promise<FireDetection | undefined> {
    return this.fireDetections.get(id);
  }

  async getAllFireDetections(): Promise<FireDetection[]> {
    return Array.from(this.fireDetections.values()).sort(
      (a, b) => (b.detectedAt?.getTime() || 0) - (a.detectedAt?.getTime() || 0)
    );
  }

  async updateFireDetection(id: string, updates: Partial<FireDetection>): Promise<FireDetection | undefined> {
    const existing = this.fireDetections.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.fireDetections.set(id, updated);
    return updated;
  }

  async createWeatherData(weather: InsertWeatherData): Promise<WeatherData> {
    const id = randomUUID();
    const weatherEntry: WeatherData = {
      ...weather,
      id,
      timestamp: new Date(),
    };
    this.weatherData.set(id, weatherEntry);
    return weatherEntry;
  }

  async getLatestWeatherData(latitude: number, longitude: number): Promise<WeatherData | undefined> {
    const entries = Array.from(this.weatherData.values());
    // Find the most recent weather data for the given location (within 0.1 degree radius)
    const nearby = entries.filter(entry => 
      Math.abs(entry.latitude - latitude) < 0.1 && 
      Math.abs(entry.longitude - longitude) < 0.1
    );
    
    return nearby.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))[0];
  }

  async createEmergencyNotification(notification: InsertEmergencyNotification): Promise<EmergencyNotification> {
    const id = randomUUID();
    const emergencyNotification: EmergencyNotification = {
      ...notification,
      id,
      sentAt: new Date(),
      fireDetectionId: notification.fireDetectionId || null,
    };
    this.emergencyNotifications.set(id, emergencyNotification);
    return emergencyNotification;
  }

  async getNotificationsByFireId(fireDetectionId: string): Promise<EmergencyNotification[]> {
    return Array.from(this.emergencyNotifications.values()).filter(
      notification => notification.fireDetectionId === fireDetectionId
    );
  }
}

export const storage = new MemStorage();
