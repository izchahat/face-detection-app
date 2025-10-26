from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import traceback

app = Flask(__name__)
CORS(app)

# Load Haar Cascade classifiers
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    print("✓ OpenCV classifiers loaded successfully")
except Exception as e:
    print(f"✗ Error loading classifiers: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Face Detection Service is running', 'opencv_version': cv2.__version__}), 200

@app.route('/detect-faces', methods=['POST'])
def detect_faces():
    try:
        print("\n" + "="*50)
        print("📸 New face detection request received")
        
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Remove data URL prefix if present
        if ',' in image_data:
            header, image_data = image_data.split(',', 1)
            print(f"✓ Image format: {header[:50]}...")
        
        # Decode base64 image
        img_bytes = base64.b64decode(image_data)
        print(f"✓ Decoded image size: {len(img_bytes)} bytes")
        
        # Convert to PIL Image
        img = Image.open(io.BytesIO(img_bytes))
        print(f"✓ Image dimensions: {img.size[0]}x{img.size[1]}")
        
        # Convert to OpenCV format (BGR)
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale for detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization to improve detection
        gray = cv2.equalizeHist(gray)
        
        print("🔍 Running face detection...")
        
        # Detect faces with multiple scale factors for better results
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,      # Smaller scale factor for better detection
            minNeighbors=3,         # Lower threshold to detect more faces
            minSize=(20, 20),       # Smaller minimum size
            maxSize=(500, 500),     # Maximum size limit
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        print(f"✓ Detected {len(faces)} face(s)")
        
        # Draw rectangles around detected faces
        faces_list = []
        for i, (x, y, w, h) in enumerate(faces):
            # Draw thick green rectangle
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 4)
            
            # Add face number label with background
            label = f'Face {i + 1}'
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.8
            thickness = 2
            
            # Get text size for background rectangle
            (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, thickness)
            
            # Draw background rectangle for text
            cv2.rectangle(frame, (x, y - text_height - 10), (x + text_width, y), (0, 255, 0), -1)
            
            # Draw text
            cv2.putText(frame, label, (x, y - 5), font, font_scale, (0, 0, 0), thickness)
            
            # Detect eyes in face region for verification
            roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=3)
            
            faces_list.append({
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h),
                'confidence': 95,
                'has_eyes': len(eyes) > 0
            })
            
            print(f"  Face {i+1}: Position=({x},{y}), Size={w}x{h}, Eyes={'Yes' if len(eyes) > 0 else 'No'}")
        
        # Convert result back to base64
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
        result_image = base64.b64encode(buffer).decode()
        
        print("✓ Face detection completed successfully")
        print("="*50 + "\n")
        
        return jsonify({
            'success': True,
            'faces_count': len(faces),
            'faces': faces_list,
            'result_image': f'data:image/jpeg;base64,{result_image}',
            'image_size': f"{img.size[0]}x{img.size[1]}"
        }), 200
    
    except Exception as e:
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print(f"✗ Error: {error_msg}")
        print(f"✗ Traceback:\n{error_trace}")
        return jsonify({
            'success': False, 
            'error': error_msg,
            'trace': error_trace
        }), 400

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Face Detection Service Starting...")
    print(f"📦 OpenCV Version: {cv2.__version__}")
    print(f"🔧 Python Version: {__import__('sys').version}")
    print("="*50 + "\n")
    app.run(debug=True, port=5000, host='0.0.0.0')