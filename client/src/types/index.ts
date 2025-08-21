export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  latitude: number;
  longitude: number;
}

export interface FireSpreadPrediction {
  center: {
    latitude: number;
    longitude: number;
  };
  predictions: Array<{
    timeframe: string;
    radius: number;
    confidence: number;
  }>;
  affectedArea: number;
  evacuationRadius: number;
}

export interface FireDetectionResult {
  fireDetected: boolean;
  confidence: number;
  detection?: {
    id: string;
    latitude: number;
    longitude: number;
    riskLevel: string;
    detectedAt: string;
  };
  weatherData?: WeatherData;
  spreadPrediction?: FireSpreadPrediction;
  message?: string;
}

export interface SystemStatus {
  firesat: { status: string; lastCheck: Date };
  ecmwf: { status: string; lastCheck: Date };
  noaa: { status: string; lastCheck: Date };
  usc_cwgan: { status: string; lastCheck: Date };
  stats: {
    avgProcessingTime: string;
    detectionAccuracy: string;
  };
}

export interface EmergencyNotification {
  id: string;
  agency: string;
  status: string;
  sentAt: string;
}
