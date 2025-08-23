export async function detectFireInImage(imageBuffer: Buffer): Promise<{
  isFireDetected: boolean;
  confidence: number;
}> {
  try {
    console.log('Starting fire detection process...');
    
    // Create form data with the image
    const formData = new FormData();
    
    // Convert Buffer to Blob properly
    const arrayBuffer = new Uint8Array(imageBuffer).buffer;
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    formData.append('image', blob, 'image.jpg');

    console.log('Sending request to Flask server...');
    
    // Send request to Flask server
    const response = await fetch('http://localhost:5000/detect', {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Fire detection failed: ${errorText}`);
    }

    const result = await response.json();
    console.log('Detection result:', result);
    
    if (!result.confidence || result.is_fire === undefined) {
      throw new Error('Invalid response format from detection server');
    }
    
    return {
      isFireDetected: result.is_fire,
      confidence: result.confidence
    };
    
  } catch (error) {
    console.error('Fire detection error:', error);
    throw new Error('Failed to process fire detection: ' + (error as Error).message);
  }
}
