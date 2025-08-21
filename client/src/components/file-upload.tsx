import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadFireImage } from "@/lib/api";
import { FireDetectionResult } from "@/types";
import { Upload, CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  userLocation: { lat: number; lng: number } | null;
  onDetectionComplete: (result: FireDetectionResult) => void;
}

export function FileUpload({ userLocation, onDetectionComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState<string>("Ready");
  const [fireDetected, setFireDetected] = useState<string>("No");
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

    if (!file.type.startsWith('image/')) {
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
      // Simulate AI processing with progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFireImage(file, userLocation.lat, userLocation.lng);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setDetectionStatus("Complete");
      setFireDetected(result.fireDetected ? "Yes" : "No");
      
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
      setTimeout(() => {
        setProcessingProgress(0);
        setDetectionStatus("Ready");
        setFireDetected("No");
      }, 3000);
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
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging 
              ? "border-action-purple bg-purple-50" 
              : "border-gray-300 hover:border-action-purple"
          } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
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

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={processingProgress} className="w-full" data-testid="progress-processing" />
            <p className="text-xs text-center text-gray-500">
              Processing with AI fire detection models...
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">AI Processing Status:</span>
            <span 
              className={`font-medium ${
                detectionStatus === "Complete" ? "text-safe-green" :
                detectionStatus === "Error" ? "text-emergency-red" :
                detectionStatus === "Processing..." ? "text-action-purple" :
                "text-safe-green"
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
                fireDetected === "Yes" ? "text-emergency-red" :
                fireDetected === "Failed" ? "text-emergency-red" :
                fireDetected === "Analyzing..." ? "text-action-purple" :
                "text-gray-500"
              }`}
              data-testid="text-fire-detected"
            >
              {fireDetected}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
