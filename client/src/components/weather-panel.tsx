import { useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData } from "@/lib/api";
import { WeatherData, FireDetectionResult } from "@/types";
import { CloudSun, Wind, Compass, Thermometer, Droplets, RotateCcw, TriangleAlert } from "lucide-react";

interface WeatherPanelProps {
  userLocation: { lat: number; lng: number } | null;
  weatherData: WeatherData | null;
  currentDetection: FireDetectionResult | null;
  onUpdateLocation: () => void;
}

export function WeatherPanel({ userLocation, weatherData, currentDetection, onUpdateLocation }: WeatherPanelProps) {
  const { data: fetchedWeatherData, refetch } = useQuery<WeatherData>({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const displayWeatherData = weatherData || fetchedWeatherData;

  useEffect(() => {
    if (userLocation) {
      refetch();
    }
  }, [userLocation, refetch]);

  const getRiskLevel = () => {
    if (currentDetection?.detection?.riskLevel) {
      return currentDetection.detection.riskLevel;
    }
    if (displayWeatherData && 'temperature' in displayWeatherData) {
      // Calculate risk based on weather conditions
      const { temperature, humidity, windSpeed } = displayWeatherData;
      let riskScore = 0;
      
      if (temperature > 35) riskScore += 3;
      else if (temperature > 30) riskScore += 2;
      else if (temperature > 25) riskScore += 1;
      
      if (humidity < 20) riskScore += 3;
      else if (humidity < 30) riskScore += 2;
      else if (humidity < 40) riskScore += 1;
      
      if (windSpeed > 20) riskScore += 3;
      else if (windSpeed > 15) riskScore += 2;
      else if (windSpeed > 10) riskScore += 1;
      
      if (riskScore >= 7) return "EXTREME";
      if (riskScore >= 5) return "HIGH";
      if (riskScore >= 3) return "MODERATE";
      return "LOW";
    }
    return "UNKNOWN";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "EXTREME": return "text-emergency-red bg-red-50 border-emergency-red";
      case "HIGH": return "text-alert-orange bg-orange-50 border-alert-orange";
      case "MODERATE": return "text-caution-amber bg-amber-50 border-caution-amber";
      case "LOW": return "text-safe-green bg-green-50 border-safe-green";
      default: return "text-gray-500 bg-gray-50 border-gray-300";
    }
  };

  const riskLevel = getRiskLevel();
  const isHighRisk = ["EXTREME", "HIGH"].includes(riskLevel);

  return (
    <div className="space-y-6">
      {/* Weather Analysis */}
      {/* <Card className="bg-white shadow-lg" data-testid="card-weather-analysis">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CloudSun className="text-alert-orange mr-2" />
            Weather Analysis
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayWeatherData ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg" data-testid="metric-wind-speed">
                  <Wind className="mx-auto text-2xl text-blue-500 mb-2" />
                  <p className="text-xs text-gray-600">Wind Speed</p>
                  <p className="text-lg font-semibold">{Math.round((displayWeatherData as WeatherData).windSpeed)} mph</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg" data-testid="metric-wind-direction">
                  <Compass className="mx-auto text-2xl text-blue-500 mb-2" />
                  <p className="text-xs text-gray-600">Direction</p>
                  <p className="text-lg font-semibold">{(displayWeatherData as WeatherData).windDirection}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg" data-testid="metric-temperature">
                  <Thermometer className="mx-auto text-2xl text-red-500 mb-2" />
                  <p className="text-xs text-gray-600">Temperature</p>
                  <p className="text-lg font-semibold">{Math.round((displayWeatherData as WeatherData).temperature)}°C</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg" data-testid="metric-humidity">
                  <Droplets className="mx-auto text-2xl text-blue-500 mb-2" />
                  <p className="text-xs text-gray-600">Humidity</p>
                  <p className="text-lg font-semibold">{Math.round((displayWeatherData as WeatherData).humidity)}%</p>
                </div>
              </div>
              
              {isHighRisk && (
                <Alert className={`${getRiskColor(riskLevel)} border-2`} data-testid="alert-high-risk">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">High Fire Risk Conditions Detected</span>
                    <br />
                    <span className="text-xs">Data from ECMWF AI Forecasting System</span>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading weather data...</p>
            </div>
          )}
        </CardContent>
      </Card> */}
  
  

      {/* Location & Risk Assessment */}
      <Card className="bg-white shadow-lg" data-testid="card-location-risk">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Compass className="text-emergency-red mr-2" />
            Location & Risk
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Current Location:</span>
            <span className="text-sm font-medium" data-testid="text-user-location">
              {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Loading..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fire Risk Level:</span>
            <Badge className={getRiskColor(riskLevel)} data-testid="badge-risk-level">
              {riskLevel}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Vegetation Type:</span>
            <span className="text-sm font-medium" data-testid="text-vegetation-type">Mixed Forest</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fuel Moisture:</span>
            <span className={`text-sm font-medium ${isHighRisk ? "text-emergency-red" : "text-gray-700"}`} data-testid="text-fuel-moisture">
              {isHighRisk ? "8% (Critical)" : "12% (Moderate)"}
            </span>
          </div>

          <Button 
            onClick={onUpdateLocation} 
            className="w-full mt-4 bg-action-purple text-white hover:bg-purple-700"
            data-testid="button-update-location"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Update Location
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
