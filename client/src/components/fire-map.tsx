import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FireDetectionResult } from "@/types";
import { Map, Satellite, Eye, Navigation, Plus, Minus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FireMapProps {
  userLocation: { lat: number; lng: number } | null;
  currentDetection: FireDetectionResult | null;
}

export function FireMap({ userLocation, currentDetection }: FireMapProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("real-time");
  const [mapZoom, setMapZoom] = useState(1);

  const spreadPrediction = currentDetection?.spreadPrediction;
  const hasFireDetection = currentDetection?.fireDetected;

  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.2, 0.5));

  const getSpreadRadiusPixels = (timeframe: string) => {
    if (!spreadPrediction) return 0;
    
    const prediction = spreadPrediction.predictions.find(p => p.timeframe === timeframe);
    if (!prediction) return 0;
    
    // Convert radius to pixels for visualization (scaled for demo)
    return prediction.radius * 10000 * mapZoom;
  };

  return (
    <Card className="bg-white shadow-lg overflow-hidden" data-testid="card-fire-map">
      <CardHeader className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <Map className="text-action-purple mr-2" />
            Fire Spread Prediction Map
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-safe-green rounded-full"></div>
              <span className="text-sm">Google FireSat Active</span>
            </div>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe} data-testid="select-timeframe">
              <SelectTrigger className="bg-gray-800 text-white text-sm border-gray-600 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-time">Real-time</SelectItem>
                <SelectItem value="1hour">1 Hour Prediction</SelectItem>
                <SelectItem value="6hour">6 Hour Prediction</SelectItem>
                <SelectItem value="24hour">24 Hour Prediction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Map Interface */}
        <div className="relative h-96 bg-gray-100 overflow-hidden" data-testid="map-container">
          {/* Simulated forest landscape background */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')",
              opacity: 0.7,
              transform: `scale(${mapZoom})`
            }}
          />
          
          {/* Map Overlays */}
          <div className="absolute inset-0">
            {hasFireDetection && (
              <>
                {/* Current Fire Location */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" data-testid="fire-location-marker">
                  <div className="w-8 h-8 bg-emergency-red rounded-full animate-pulse flex items-center justify-center">
                    <Flame className="text-white text-sm" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <Badge className="bg-black bg-opacity-75 text-white text-xs">Current Fire</Badge>
                  </div>
                </div>
                
                {/* Fire Spread Prediction Zones */}
                {spreadPrediction && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* 1 Hour Spread */}
                    <div 
                      className="bg-emergency-red bg-opacity-30 rounded-full border-2 border-emergency-red border-dashed fire-spread-animation"
                      style={{
                        width: `${Math.max(getSpreadRadiusPixels("1hour"), 80)}px`,
                        height: `${Math.max(getSpreadRadiusPixels("1hour"), 80)}px`,
                        animationDelay: "0.5s"
                      }}
                      data-testid="spread-zone-1hour"
                    />
                    {/* 6 Hour Spread */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-alert-orange bg-opacity-20 rounded-full border-2 border-alert-orange border-dashed fire-spread-animation"
                      style={{
                        width: `${Math.max(getSpreadRadiusPixels("6hour"), 128)}px`,
                        height: `${Math.max(getSpreadRadiusPixels("6hour"), 128)}px`,
                        animationDelay: "1s"
                      }}
                      data-testid="spread-zone-6hour"
                    />
                    {/* 24 Hour Spread */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-caution-amber bg-opacity-10 rounded-full border-2 border-caution-amber border-dashed fire-spread-animation"
                      style={{
                        width: `${Math.max(getSpreadRadiusPixels("24hour"), 192)}px`,
                        height: `${Math.max(getSpreadRadiusPixels("24hour"), 192)}px`,
                        animationDelay: "1.5s"
                      }}
                      data-testid="spread-zone-24hour"
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Wind Direction Indicator */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3" data-testid="wind-indicator">
              <div className="flex items-center space-x-2">
                <Navigation className="text-blue-500 transform rotate-45 wind-arrow" />
                <div>
                  <p className="text-xs text-gray-600">Wind Direction</p>
                  <p className="text-sm font-semibold">NW 15mph</p>
                </div>
              </div>
            </div>
            
            {/* Emergency Zones Legend */}
            <div className="absolute bottom-4 left-4 space-y-2" data-testid="emergency-legend">
              <div className="bg-white bg-opacity-90 rounded-lg p-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emergency-red rounded-full"></div>
                  <span>Immediate Evacuation Zone</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-90 rounded-lg p-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-alert-orange rounded-full"></div>
                  <span>Prepare to Evacuate</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-90 rounded-lg p-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-caution-amber rounded-full"></div>
                  <span>Monitor Conditions</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg" data-testid="map-controls">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 hover:bg-gray-50 border-b border-gray-200 rounded-b-none"
              onClick={handleZoomIn}
              data-testid="button-zoom-in"
            >
              <Plus className="text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 hover:bg-gray-50 rounded-t-none"
              onClick={handleZoomOut}
              data-testid="button-zoom-out"
            >
              <Minus className="text-gray-600" />
            </Button>
          </div>
        </div>
        
        {/* Map Stats */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emergency-red" data-testid="stat-affected-area">
                {spreadPrediction?.affectedArea || 0}
              </p>
              <p className="text-sm text-gray-600">Acres at Risk (24h)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-alert-orange" data-testid="stat-evacuation-radius">
                {spreadPrediction?.evacuationRadius?.toFixed(1) || "0.0"}
              </p>
              <p className="text-sm text-gray-600">Miles Evacuation Radius</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-action-purple" data-testid="stat-confidence">
                {currentDetection?.confidence ? Math.round(currentDetection.confidence * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">AI Prediction Confidence</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
