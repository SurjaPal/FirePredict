import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FireDetectionResult } from "@/types";
import { History } from "lucide-react";

interface RecentAlertsTableProps {
  fireDetections: any[] | null;
}

export function RecentAlertsTable({ fireDetections }: RecentAlertsTableProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "EXTREME":
        return "bg-emergency-red text-white";
      case "HIGH":
        return "bg-alert-orange text-white";
      case "MODERATE":
        return "bg-caution-amber text-white";
      case "LOW":
        return "bg-safe-green text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (detected: boolean) => {
    return detected ? "bg-emergency-red text-white" : "bg-safe-green text-white";
  };

  return (
    <Card className="bg-white shadow-lg" data-testid="card-recent-alerts">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <History className="text-gray-600 mr-2" />
          Recent Fire Alerts & Predictions
        </h2>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Time</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Location</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Risk Level</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Confidence</TableHead>
                <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fireDetections && fireDetections.length > 0 ? (
                fireDetections.slice(0, 10).map((detection, index) => (
                  <TableRow key={detection.id} className="border-b border-gray-100" data-testid={`alert-row-${index}`}>
                    <TableCell className="py-3 px-4 text-sm" data-testid={`cell-time-${index}`}>
                      {new Date(detection.detectedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm" data-testid={`cell-location-${index}`}>
                      {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="py-3 px-4" data-testid={`cell-risk-${index}`}>
                      <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(detection.riskLevel)}`}>
                        {detection.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm" data-testid={`cell-confidence-${index}`}>
                      {Math.round(detection.confidence * 100)}%
                    </TableCell>
                    <TableCell className="py-3 px-4" data-testid={`cell-status-${index}`}>
                      <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                        detection.notificationsSent ? "bg-safe-green text-white" : "bg-gray-500 text-white"
                      }`}>
                        {detection.notificationsSent ? "NOTIFIED" : "PENDING"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No fire detections recorded yet. Upload an image to begin monitoring.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
