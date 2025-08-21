import { apiRequest } from "./queryClient";

export async function uploadFireImage(file: File, latitude: number, longitude: number) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());

  const response = await fetch('/api/fire-detection', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error}`);
  }

  return response.json();
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
