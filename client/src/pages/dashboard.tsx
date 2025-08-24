import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/file-upload";
import { WeatherPanel } from "@/components/weather-panel";
import { FireMap } from "@/components/fire-map";
import { EmergencyAlerts } from "@/components/emergency-alerts";
import { AIStatus } from "@/components/ai-status";
import { RecentAlertsTable } from "@/components/recent-alerts-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemStatus, getFireDetections } from "@/lib/api";
import { FireDetectionResult, WeatherData, SystemStatus } from "@/types";
import { Flame, TriangleAlert, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { sendEmergencyAlerts } from "@/lib/api";

export default function Dashboard() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentDetection, setCurrentDetection] = useState<FireDetectionResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to San Francisco coordinates
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: fireDetections, refetch: refetchDetections } = useQuery<any[]>({
    queryKey: ["/api/fire-detections"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleFireDetectionComplete = async (result: FireDetectionResult) => {
    setCurrentDetection(result);
    if (result.weatherData) {
      setWeatherData(result.weatherData);
    }
    
    if (result.fireDetected) {
      toast({
        title: "🔥 Fire Detected!",
        description: `Risk Level: ${result.detection?.riskLevel} | Confidence: ${Math.round((result.confidence || 0))}%`,
        variant: "destructive",
      });
      // if (userLocation && currentDetection && currentDetection.fireDetected) {
      //   await sendEmergencyAlerts({
      //     location: userLocation,
      //     confidence: currentDetection.confidence || 0,
      //     imageUrl: currentDetection.detection?.imageUrl
      //   });
      // }
      console.log("first");
    } else {
      toast({
        title: "✅ No Fire Detected",
        description: result.message || "The uploaded image appears to be safe.",
      });
    }
    
    // Refresh fire detections list
    refetchDetections();
  };

  const handleEmergencyCall = () => {
    toast({
      title: "📞 Emergency Call Initiated",
      description: "Connecting to emergency services...",
    });
  };

  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "📍 Location Updated",
            description: "Your current location has been refreshed.",
          });
        },
        (error) => {
          toast({
            title: "❌ Location Error",
            description: "Failed to update location. Please try again.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-emergency-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Flame className="text-emergency-red text-2xl mr-3" data-testid="logo-icon" />
                <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">ForeSightAI</h1>
              </div>
              <div className="hidden md:block ml-6">
                <span className="text-sm text-gray-600">Emergency Fire Detection & Prediction System</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-3 h-3 bg-safe-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">ECMWF AI System Online</span>
              </div>
              <Button 
                className="bg-emergency-red text-white hover:bg-red-700" 
                data-testid="button-emergency-alert"
                onClick={handleEmergencyCall}
              >
                <TriangleAlert className="mr-2 h-4 w-4" />
                Emergency Alert
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload
              userLocation={userLocation}
              onDetectionComplete={handleFireDetectionComplete}
              data-testid="component-file-upload"
            />
            
            <WeatherPanel
              userLocation={userLocation}
              weatherData={weatherData}
              currentDetection={currentDetection}
              onUpdateLocation={handleUpdateLocation}
              data-testid="component-weather-panel"
            />
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <FireMap
              userLocation={userLocation}
              currentDetection={currentDetection}
              data-testid="component-fire-map"
            />
          </div>
        </div>

        {/* Emergency Dashboard */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmergencyAlerts
            currentDetection={currentDetection}
            data-testid="component-emergency-alerts"
          />
          
          <AIStatus
            systemStatus={systemStatus || null}
            data-testid="component-ai-status"
          />
        </div>

        {/* Recent Alerts Table */}
        <div className="mt-6">
          <RecentAlertsTable
            fireDetections={fireDetections || null}
            data-testid="component-recent-alerts"
          />
        </div>
      </div>

      {/* Floating Emergency Call Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          className="bg-emergency-red text-white w-14 h-14 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110"
          data-testid="button-emergency-call"
          onClick={handleEmergencyCall}
        >
          <Phone className="text-xl" />
        </Button>
      </div>
    </div>
  );
}
