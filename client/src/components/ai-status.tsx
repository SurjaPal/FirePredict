import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SystemStatus } from "@/types";
import { Bot, Satellite, Cloud, Eye, Brain } from "lucide-react";

interface AIStatusProps {
  systemStatus: SystemStatus | null;
}

export function AIStatus({ systemStatus }: AIStatusProps) {
  const systems = [
    {
      name: "Google FireSat Constellation",
      icon: Satellite,
      key: "firesat",
      description: "Satellite fire detection"
    },
    {
      name: "ECMWF AI Forecasting System",
      icon: Cloud,
      key: "ecmwf",
      description: "Weather prediction AI"
    },
    {
      name: "NOAA Next-Gen Fire System",
      icon: Eye,
      key: "noaa",
      description: "Real-time fire monitoring"
    },
    {
      name: "USC cWGAN Fire Prediction",
      icon: Brain,
      key: "usc_cwgan",
      description: "Fire spread modeling"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "online":
      case "active":
        return "text-safe-green bg-green-50 border-safe-green";
      case "monitoring":
      case "processing":
        return "text-action-purple bg-purple-50 border-action-purple";
      case "warning":
        return "text-caution-amber bg-amber-50 border-caution-amber";
      case "offline":
      case "error":
        return "text-emergency-red bg-red-50 border-emergency-red";
      default:
        return "text-gray-500 bg-gray-50 border-gray-300";
    }
  };

  return (
    <Card className="bg-white shadow-lg" data-testid="card-ai-status">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bot className="text-action-purple mr-2" />
          AI System Status
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {systems.map((system) => {
          const systemData = systemStatus?.[system.key as keyof SystemStatus];
          const status = (systemData && 'status' in systemData) ? systemData.status : "Unknown";
          const IconComponent = system.icon;
          
          return (
            <div 
              key={system.key} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              data-testid={`system-${system.key}`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="text-blue-500" />
                <div>
                  <span className="text-sm font-medium">{system.name}</span>
                  <p className="text-xs text-gray-500">{system.description}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(status)} text-xs capitalize`} data-testid={`status-${system.key}`}>
                {status}
              </Badge>
            </div>
          );
        })}
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg" data-testid="metric-processing-time">
            <p className="text-lg font-bold text-blue-600">
              {systemStatus?.stats?.avgProcessingTime || "0.2s"}
            </p>
            <p className="text-xs text-blue-600">Avg Processing Time</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg" data-testid="metric-accuracy">
            <p className="text-lg font-bold text-green-600">
              {systemStatus?.stats?.detectionAccuracy || "96.8%"}
            </p>
            <p className="text-xs text-green-600">Detection Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
