import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
import os
import sys
import json
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

class FireDetector:
    def __init__(self, model):
        self.model = model
        self.img_size = (224, 224)
        self.classes = ['No Fire', 'Fire']

    def preprocess_image(self, image_path):
        img = tf.keras.preprocessing.image.load_img(image_path, target_size=self.img_size)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, image_path, threshold=0.5):
        processed_img = self.preprocess_image(image_path)
        raw_prediction = self.model.predict(processed_img, verbose=0)[0][0]
        predicted_class = 0 if raw_prediction > threshold else 1

        confidence = 1 - raw_prediction if predicted_class == 1 else raw_prediction

        return {
            'raw_score': float(raw_prediction),
            'predicted_class': int(predicted_class),
            'class_name': self.classes[predicted_class],
            'confidence': float(confidence),
            'is_fire': bool(predicted_class == 1),
            'threshold': threshold
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            'error': 'Please provide an image path'
        }))
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({
            'error': f'Image file not found: {image_path}'
        }))
        sys.exit(1)

    model_path = os.path.join(os.path.dirname(__file__), 'CustomCNN_best_model.h5')
    if not os.path.exists(model_path):
        print(json.dumps({
            'error': f'Model file not found: {model_path}'
        }))
        sys.exit(1)

    try:
        model = load_model(model_path)
        detector = FireDetector(model)
        result = detector.predict(image_path)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
