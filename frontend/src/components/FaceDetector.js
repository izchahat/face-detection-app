import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { faceAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PYTHON_SERVICE_URL = 'http://localhost:5000';

const FaceDetector = ({ onDetectionComplete }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const { user } = useAuth();

  React.useEffect(() => {
    checkService();
  }, []);

  const checkService = async () => {
    try {
      await axios.get(`${PYTHON_SERVICE_URL}/health`);
      setServiceStatus('ready');
    } catch (error) {
      setServiceStatus('error');
    }
  };

  const detectFacesWithPython = async (imageData) => {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/detect-faces`, {
      image: imageData
    });
    return response.data;
  };

  const captureWebcam = async () => {
    if (!webcamRef.current) return;
    
    if (serviceStatus !== 'ready') {
      alert('Python face detection service is not running!');
      return;
    }

    setLoading(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const result = await detectFacesWithPython(imageSrc);

      const detectionData = {
        originalImage: imageSrc,
        resultImage: result.result_image,
        facesDetected: result.faces_count,
        faceCoordinates: result.faces
      };

      setDetectionResult(detectionData);
      await saveDetection(detectionData);
    } catch (error) {
      alert('Error detecting faces. Make sure Python service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (serviceStatus !== 'ready') {
      alert('Python face detection service is not running!');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const imageSrc = event.target.result;
        const result = await detectFacesWithPython(imageSrc);

        const detectionData = {
          originalImage: imageSrc,
          resultImage: result.result_image,
          facesDetected: result.faces_count,
          faceCoordinates: result.faces
        };

        setDetectionResult(detectionData);
        await saveDetection(detectionData);
      } catch (error) {
        alert('Error detecting faces. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const saveDetection = async (data) => {
    try {
      await faceAPI.detect({
        userId: user.id,
        ...data,
      });
      onDetectionComplete?.(data);
    } catch (error) {
      console.error('Error saving detection:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Service Status Banner */}
      {serviceStatus === 'checking' && (
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 border-l-4 border-blue-500 text-blue-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-semibold">Connecting to AI service...</span>
          </div>
        </div>
      )}

      {serviceStatus === 'error' && (
        <div className="bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚠️</span>
            <span className="font-bold text-lg">AI Service Not Running</span>
          </div>
          <p className="text-sm ml-11">
            Start the Python service: <code className="bg-red-300 px-2 py-1 rounded font-mono">cd python-service && python app.py</code>
          </p>
        </div>
      )}

      {serviceStatus === 'ready' && (
        <div className="bg-gradient-to-r from-green-100 to-green-200 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-xl mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">AI Service Ready - Start Detecting!</span>
          </div>
        </div>
      )}

      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Webcam Option */}
          <button
            onClick={() => setMode('webcam')}
            disabled={serviceStatus !== 'ready'}
            className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📷</div>
            <h3 className="text-2xl font-bold mb-2">Use Webcam</h3>
            <p className="text-blue-100 text-sm">Capture and detect faces in real-time</p>
            <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              Live
            </div>
          </button>

          {/* Upload Option */}
          <button
            onClick={() => setMode('upload')}
            disabled={serviceStatus !== 'ready'}
            className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📁</div>
            <h3 className="text-2xl font-bold mb-2">Upload Image</h3>
            <p className="text-purple-100 text-sm">Select an image from your device</p>
            <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              Browse
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <button
            onClick={() => {
              setMode('');
              setDetectionResult(null);
            }}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Back to Options</span>
          </button>

          {mode === 'webcam' && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                  }}
                />
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="animate-spin h-16 w-16 mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-2xl font-bold">Analyzing faces...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={captureWebcam}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {loading ? '🔍 Detecting...' : '📸 Capture & Detect Faces'}
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div>
              <div className="border-4 border-dashed border-gray-300 rounded-3xl p-16 text-center hover:border-purple-500 transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-9xl mb-6 animate-float">📁</div>
                  <p className="text-2xl font-bold text-gray-700 mb-2">Drop your image here</p>
                  <p className="text-gray-500 mb-4">or click to browse</p>
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                    Select Image
                  </div>
                </label>
              </div>
              {loading && (
                <div className="mt-6 text-center">
                  <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-xl font-semibold text-purple-600">Analyzing your image...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {detectionResult && (
        <div className="mt-8 space-y-6 animate-fadeIn">
          {/* Result Banner */}
          <div className={`${
            detectionResult.facesDetected > 0 
              ? 'bg-gradient-to-r from-green-400 to-green-500' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          } text-white rounded-3xl p-8 shadow-2xl text-center`}>
            <div className="text-7xl mb-4">
              {detectionResult.facesDetected > 0 ? '🎉' : '😔'}
            </div>
            <h3 className="text-4xl font-extrabold mb-2">
              {detectionResult.facesDetected > 0 
                ? `${detectionResult.facesDetected} Face${detectionResult.facesDetected > 1 ? 's' : ''} Detected!`
                : 'No Faces Detected'}
            </h3>
            <p className="text-xl opacity-90">
              {detectionResult.facesDetected > 0 
                ? 'Successfully analyzed your image'
                : 'Try again with better lighting and angle'}
            </p>
          </div>
          
          {/* Images Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4 px-6 font-bold text-center">
                📷 Original Image
              </div>
              <img src={detectionResult.originalImage} alt="Original" className="w-full" />
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 font-bold text-center">
                ✅ Detection Result
              </div>
              <img src={detectionResult.resultImage} alt="Result" className="w-full" />
            </div>
          </div>

          {/* Detection Details */}
          {detectionResult.facesDetected > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl border-2 border-blue-100">
              <h4 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">📊</span>
                Detection Analytics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detectionResult.faceCoordinates.map((face, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">👤</span>
                      <span className="text-xl font-bold text-gray-800">Face {idx + 1}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-semibold">({face.x}, {face.y})</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-semibold">{face.width}×{face.height}px</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-semibold text-green-600">{face.confidence}%</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips for No Detection */}
          {detectionResult.facesDetected === 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 shadow-xl border-2 border-yellow-200">
              <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="text-3xl">💡</span>
                Tips for Better Detection
              </h4>
              <ul className="space-y-3">
                {[
                  'Ensure good lighting conditions',
                  'Face the camera directly',
                  'Remove sunglasses or face coverings',
                  'Position yourself closer to the camera',
                  'Use a clear, high-quality image'
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceDetector;