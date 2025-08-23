import { apiRequest } from "./queryClient";

export async function uploadFireImage(file: File, latitude: number, longitude: number) {
  const formData = new FormData();
  formData.append('image', file);
  
  console.log('Sending request to Flask server...');
  
  try {
    // Send directly to Flask server
    const response = await fetch('http://localhost:5000/detect', {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`Upload failed: ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    // Transform the response to match our frontend expectations
    return {
      fireDetected: result.is_fire,
      confidence: result.confidence * 100, // Convert to percentage
      detection: {
        id: Date.now().toString(),
        latitude,
        longitude,
        riskLevel: result.confidence > 0.8 ? 'HIGH' : result.confidence > 0.5 ? 'MEDIUM' : 'LOW',
        detectedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error in uploadFireImage:', error);
    throw error;
  }
  
  // Transform the response to match our frontend expectations
  return {
    fireDetected: result.is_fire,
    confidence: result.confidence * 100, // Convert to percentage
    detection: {
      id: Date.now().toString(),
      latitude,
      longitude,
      riskLevel: result.confidence > 0.8 ? 'HIGH' : result.confidence > 0.5 ? 'MEDIUM' : 'LOW',
      detectedAt: new Date().toISOString()
    }
  };
}

export async function getWeatherData(latitude: number, longitude: number) {
  const response = await apiRequest('GET', `/api/weather?lat=${latitude}&lng=${longitude}`);
  return response.json();
}

export async function getSystemStatus() {
  const response = await apiRequest('GET', '/api/system-status');
  return response.json();
}

export async function getFireDetections() {
  const response = await apiRequest('GET', '/api/fire-detections');
  return response.json();
}

export async function getEmergencyNotifications(fireId: string) {
  const response = await apiRequest('GET', `/api/notifications/${fireId}`);
  return response.json();
}
