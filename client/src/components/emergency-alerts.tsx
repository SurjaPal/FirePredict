import { useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getEmergencyNotifications } from "@/lib/api";
import { FireDetectionResult } from "@/types";
import { Radio, CheckCircle, Clock, XCircle } from "lucide-react";

interface EmergencyAlertsProps {
  currentDetection: FireDetectionResult | null;
}

export function EmergencyAlerts({ currentDetection }: EmergencyAlertsProps) {
  const { data: notifications, refetch } = useQuery<any[]>({
    queryKey: ["/api/notifications", currentDetection?.detection?.id],
    enabled: !!currentDetection?.detection?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (currentDetection?.detection?.id) {
      refetch();
    }
  }, [currentDetection, refetch]);

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

  const getNotificationStatus = (agency: string) => {
    console.log(agency);
    
    if (!notifications || !Array.isArray(notifications)) {
      // If fire is detected but no notifications exist yet, show as SENT
      return currentDetection?.fireDetected ? "SENT" : "PENDING";
    }
    const notification = notifications.find((n: any) => n.agency === agency);
    return notification?.status || (currentDetection?.fireDetected ? "SENT" : "PENDING");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-3 h-3 text-safe-green" />;
      case "FAILED":
        return <XCircle className="w-3 h-3 text-emergency-red" />;
      case "SENT":
        return <Clock className="w-3 h-3 text-caution-amber animate-pulse" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-safe-green";
      case "FAILED":
        return "text-emergency-red";
      case "SENT":
        return "text-caution-amber";
      default:
        return "text-gray-400";
    }
  };

  const successCount = Array.isArray(notifications) ? notifications.filter((n: any) => n.status === "DELIVERED").length : 0;
  const totalAgencies = agencies.length;

  return (
    <Card className="bg-white shadow-lg" data-testid="card-emergency-alerts">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Radio className="text-emergency-red mr-2" />
          Emergency Agency Alerts
        </h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {agencies.map((agency, index) => {
          const status = getNotificationStatus(agency);
          const timestamp = Array.isArray(notifications) ? notifications.find((n: any) => n.agency === agency)?.sentAt : undefined;
          
          return (
            <div 
              key={agency} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              data-testid={`notification-${index}`}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(status)}
                <span className="text-sm font-medium">{agency}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs ${getStatusColor(status)} capitalize`}>
                  {status.toLowerCase()}
                </span>
                {timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {currentDetection?.fireDetected && (
          <Alert className={`mt-4 ${
            successCount === totalAgencies 
              ? "bg-safe-green bg-opacity-10 border-safe-green" 
              : successCount > 0
              ? "bg-caution-amber bg-opacity-10 border-caution-amber"
              : "bg-gray-50 border-gray-300"
          }`} data-testid="alert-notification-summary">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">
                {successCount} of {totalAgencies} agencies notified successfully
              </span>
              {successCount === totalAgencies && (
                <p className="text-xs mt-1 text-green-700">
                  All emergency agencies have been alerted to the fire detection.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!currentDetection?.fireDetected && (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              No active fire detection. Upload an image to begin emergency notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
