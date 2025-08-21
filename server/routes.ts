import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFireDetectionSchema, insertWeatherDataSchema, insertEmergencyNotificationSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

// Extend Request interface to include file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Fire detection endpoints
  app.post("/api/fire-detection", upload.single("image"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const body = z.object({
        latitude: z.string().transform(Number),
        longitude: z.string().transform(Number),
      }).parse(req.body);

      // Mock AI fire detection - in production this would call computer vision API
      const mockFireDetected = Math.random() > 0.3; // 70% chance of fire detection
      const confidence = mockFireDetected ? 0.85 + Math.random() * 0.15 : 0.1 + Math.random() * 0.3;
      
      if (!mockFireDetected) {
        return res.json({ 
          fireDetected: false, 
          confidence: confidence,
          message: "No fire detected in the uploaded image"
        });
      }

      // Get weather data for fire spread prediction
      const weatherData = await getWeatherData(body.latitude, body.longitude);
      
      // Calculate risk level based on weather conditions
      const riskLevel = calculateRiskLevel(weatherData);
      
      // Generate fire spread prediction
      const spreadPrediction = generateSpreadPrediction(body.latitude, body.longitude, weatherData);

      const fireDetection = await storage.createFireDetection({
        imageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        latitude: body.latitude,
        longitude: body.longitude,
        confidence,
        riskLevel,
        weatherData,
        spreadPrediction,
      });

      // Send emergency notifications
      await sendEmergencyNotifications(fireDetection.id);

      res.json({
        fireDetected: true,
        detection: fireDetection,
        weatherData,
        spreadPrediction
      });

    } catch (error) {
      console.error("Fire detection error:", error);
      res.status(500).json({ message: "Failed to process fire detection" });
    }
  });

  app.get("/api/fire-detections", async (req, res) => {
    try {
      const detections = await storage.getAllFireDetections();
      res.json(detections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fire detections" });
    }
  });

  app.get("/api/fire-detections/:id", async (req, res) => {
    try {
      const detection = await storage.getFireDetection(req.params.id);
      if (!detection) {
        return res.status(404).json({ message: "Fire detection not found" });
      }
      res.json(detection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fire detection" });
    }
  });

  // Weather data endpoints
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat, lng } = z.object({
        lat: z.string().transform(Number),
        lng: z.string().transform(Number)
      }).parse(req.query);

      const weatherData = await getWeatherData(lat, lng);
      res.json(weatherData);
    } catch (error) {
      console.error("Weather data error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Emergency notifications endpoint
  app.get("/api/notifications/:fireId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByFireId(req.params.fireId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // AI system status endpoint
  app.get("/api/system-status", async (req, res) => {
    try {
      // Mock AI system status - in production this would check actual service health
      const systemStatus = {
        firesat: { status: "online", lastCheck: new Date() },
        ecmwf: { status: "active", lastCheck: new Date() },
        noaa: { status: "monitoring", lastCheck: new Date() },
        usc_cwgan: { status: "processing", lastCheck: new Date() },
        stats: {
          avgProcessingTime: "0.2s",
          detectionAccuracy: "96.8%"
        }
      };
      res.json(systemStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function getWeatherData(latitude: number, longitude: number) {
  try {
    // Use OpenWeatherMap API
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error("Weather API request failed");
    }
    
    const data = await response.json();
    
    const weatherData = {
      latitude,
      longitude,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      windDirection: getWindDirection(data.wind?.deg || 0),
    };

    // Store weather data
    await storage.createWeatherData(weatherData);
    return weatherData;
    
  } catch (error) {
    console.error("Weather API error:", error);
    // Return mock weather data if API fails
    return {
      latitude,
      longitude,
      temperature: 29 + Math.random() * 10, // 29-39°C
      humidity: 15 + Math.random() * 20, // 15-35%
      windSpeed: 10 + Math.random() * 15, // 10-25 mph
      windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
    };
  }
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(degrees / 45) % 8];
}

function calculateRiskLevel(weather: any): string {
  const { temperature, humidity, windSpeed } = weather;
  
  let riskScore = 0;
  
  // Temperature factor
  if (temperature > 35) riskScore += 3;
  else if (temperature > 30) riskScore += 2;
  else if (temperature > 25) riskScore += 1;
  
  // Humidity factor
  if (humidity < 20) riskScore += 3;
  else if (humidity < 30) riskScore += 2;
  else if (humidity < 40) riskScore += 1;
  
  // Wind speed factor
  if (windSpeed > 20) riskScore += 3;
  else if (windSpeed > 15) riskScore += 2;
  else if (windSpeed > 10) riskScore += 1;
  
  if (riskScore >= 7) return "EXTREME";
  if (riskScore >= 5) return "HIGH";
  if (riskScore >= 3) return "MODERATE";
  return "LOW";
}

function generateSpreadPrediction(latitude: number, longitude: number, weather: any) {
  const { windSpeed, windDirection } = weather;
  
  // Simple fire spread model based on wind
  const spreadRadius = {
    "1hour": Math.min(0.001 + (windSpeed * 0.0001), 0.005),
    "6hour": Math.min(0.003 + (windSpeed * 0.0003), 0.015),
    "24hour": Math.min(0.008 + (windSpeed * 0.0008), 0.04)
  };
  
  return {
    center: { latitude, longitude },
    predictions: [
      {
        timeframe: "1hour",
        radius: spreadRadius["1hour"],
        confidence: 0.94
      },
      {
        timeframe: "6hour", 
        radius: spreadRadius["6hour"],
        confidence: 0.87
      },
      {
        timeframe: "24hour",
        radius: spreadRadius["24hour"],
        confidence: 0.78
      }
    ],
    affectedArea: Math.round(Math.PI * Math.pow(spreadRadius["24hour"] * 111000, 2) / 4047), // acres
    evacuationRadius: spreadRadius["24hour"] * 111000 / 1609.34 // miles
  };
}

async function sendEmergencyNotifications(fireDetectionId: string) {
  const agencies = [
    "Ministry of Home Affairs",
    "NDMA (National Disaster Management Authority)",
    "NDRF (National Disaster Response Force)",
    "BIS (Bureau of Indian Standards)",
    "NBCI (National Building Code of India)",
    "Rashtriya Raksha University",
    "CISF (Central Industrial Security Force)",
    "International Maritime Organisation"
  ];

  for (const agency of agencies) {
    try {
      // Mock notification sending - in production this would use actual notification services
      const success = Math.random() > 0.1; // 90% success rate
      
      await storage.createEmergencyNotification({
        fireDetectionId,
        agency,
        status: success ? "DELIVERED" : "FAILED"
      });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Failed to notify ${agency}:`, error);
      await storage.createEmergencyNotification({
        fireDetectionId,
        agency,
        status: "FAILED"
      });
    }
  }
}
