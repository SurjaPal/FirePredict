import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  userLocation: { lat: number; lng: number } | null;
  onDetectionComplete: (result: {
    fireDetected: boolean;
    confidence: number;
    rawScore: number;
  }) => void;
}

export function FileUpload({ userLocation, onDetectionComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState<string>("Ready");
  const [fireDetected, setFireDetected] = useState<string>("No");
  const [confidence, setConfidence] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location services to upload fire images.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDetectionStatus("Processing...");
    setFireDetected("Analyzing...");
    setProcessingProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lat", userLocation.lat.toString());
      formData.append("lng", userLocation.lng.toString());

      const response = await fetch("http://localhost:8000/detect-fire", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      // Update UI with real results
      setProcessingProgress(100);
      setDetectionStatus("Complete");
      setFireDetected(result.fireDetected ? "Yes" : "No");
      setConfidence(result.confidence);

      // Send emergency alerts if fire is detected with high confidence

      if(result.fireDetected ) {
        console.log("Fire detected, preparing to send alerts...");
        try{

          const res = await fetch("http://localhost:8000/tweet-officials", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Fire detected at location (${userLocation.lat}, ${userLocation.lng}) with confidence ${result.confidence}%`
            })
          })
        }catch(err){
          console.error("Error sending tweet to officials:", err);
        } 
      }

      if (result.fireDetected && result.confidence > 70) {
        try {
          // Send alert to emergency services
          const alertResponse = await fetch("http://localhost:8000/api/emergency-alert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              },
              body: JSON.stringify({
                location: userLocation,
                confidence: result.confidence,
                imageUrl: result.imageUrl // if available
              }),
            });

          if (alertResponse.ok) {
            toast({
              title: "Emergency Alert Sent",
              description: "Emergency services have been notified of the fire detection.",
              variant: "default",
            });
          }
        } catch (alertError) {
          console.error("Failed to send emergency alert:", alertError);
          toast({
            title: "Alert Notification Failed",
            description: "Could not notify emergency services. Please contact them directly.",
            variant: "destructive",
          });
        }
      }

      onDetectionComplete(result);
    } catch (error) {
      console.error("Upload error:", error);
      setDetectionStatus("Error");
      setFireDetected("Failed");
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      // Reset the file input so the same file can be uploaded again
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className="bg-white shadow-lg" data-testid="card-file-upload">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Upload className="text-action-purple mr-2" />
          Fire Detection Upload
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-action-purple bg-purple-50"
              : "border-gray-300 hover:border-action-purple"
          } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isProcessing) setIsDragging(true);
          }}
          onDragEnter={() => !isProcessing && setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => !isProcessing && handleDrop(e)}
          onClick={() => !isProcessing && document.getElementById("file-input")?.click()}
          data-testid="dropzone-upload"
        >
          <CloudUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drop fire image here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, WebP (Max 10MB)
          </p>
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInputChange}
            data-testid="input-file"
          />
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={processingProgress} className="w-full" data-testid="progress-processing" />
            <p className="text-xs text-center text-gray-500">
              Processing image with AI fire detection...
            </p>
          </div>
        )}

        {/* Status and Results */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">AI Processing Status:</span>
            <span
              className={`font-medium ${
                detectionStatus === "Complete"
                  ? "text-safe-green"
                  : detectionStatus === "Error"
                  ? "text-emergency-red"
                  : detectionStatus === "Processing..."
                  ? "text-action-purple"
                  : "text-safe-green"
              }`}
              data-testid="text-processing-status"
            >
              {detectionStatus}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fire Detected:</span>
            <span
              className={`font-medium ${
                fireDetected === "Yes"
                  ? "text-emergency-red"
                  : fireDetected === "Failed"
                  ? "text-emergency-red"
                  : fireDetected === "Analyzing..."
                  ? "text-action-purple"
                  : "text-gray-500"
              }`}
              data-testid="text-fire-detected"
            >
              {fireDetected}
              {confidence !== null && (
                <span className="ml-2 text-sm text-gray-600">
                  ({confidence.toFixed(1)}% confidence)
                </span>
              )}
            </span>
          </div>
          
          {/* Reset Button */}
          {(fireDetected !== "No" || detectionStatus !== "Ready") && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  setProcessingProgress(0);
                  setDetectionStatus("Ready");
                  setFireDetected("No");
                  setConfidence(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
