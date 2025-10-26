import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceDetector from '../components/FaceDetector';
import { faceAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('detect');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await faceAPI.getHistory(user.id);
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (detectionId) => {
    if (window.confirm('Delete this detection? This action cannot be undone.')) {
      try {
        await faceAPI.deleteDetection(detectionId);
        setHistory(history.filter((h) => h._id !== detectionId));
      } catch (error) {
        console.error('Error deleting detection:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDetectionComplete = () => {
    fetchHistory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎯</div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Vision
                </h1>
                <p className="text-xs text-gray-500">AI Face Detection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-bold text-gray-800">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Detections</p>
                <p className="text-4xl font-bold mt-2">{history.length}</p>
              </div>
              <div className="text-6xl opacity-20">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Faces Detected</p>
                <p className="text-4xl font-bold mt-2">
                  {history.reduce((sum, h) => sum + h.facesDetected, 0)}
                </p>
              </div>
              <div className="text-6xl opacity-20">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Success Rate</p>
                <p className="text-4xl font-bold mt-2">
                  {history.length > 0 
                    ? Math.round((history.filter(h => h.facesDetected > 0).length / history.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="text-6xl opacity-20">✨</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('detect')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'detect'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-2">🎯</span>
              Face Detection
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-2">📋</span>
              History ({history.length})
            </button>
          </div>

          <div className="p-6">
            {/* Detection Tab */}
            {activeTab === 'detect' && (
              <div className="animate-fadeIn">
                <FaceDetector onDetectionComplete={handleDetectionComplete} />
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="animate-fadeIn">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600">Loading history...</p>
                    </div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-8xl mb-6">📭</div>
                    <p className="text-2xl font-bold text-gray-700 mb-2">No Detection History</p>
                    <p className="text-gray-500 mb-6">Start detecting faces to see your history here!</p>
                    <button
                      onClick={() => setActiveTab('detect')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                    >
                      Start Detecting →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map((item, index) => (
                      <div 
                        key={item._id} 
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100"
                      >
                        {/* Image */}
                        <div className="relative group">
                          <img
                            src={item.resultImage}
                            alt="Detection"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <button
                              onClick={() => window.open(item.resultImage)}
                              className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-6 py-2 rounded-full font-semibold transform scale-90 group-hover:scale-100 transition-all"
                            >
                              🔍 View Full
                            </button>
                          </div>
                          
                          {/* Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                              item.facesDetected > 0 
                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-600'
                            }`}>
                              {item.facesDetected > 0 ? '✓ Detected' : '✗ No Faces'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">👤</span>
                              <div>
                                <p className="text-2xl font-bold text-gray-800">
                                  {item.facesDetected}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.facesDetected === 1 ? 'Face' : 'Faces'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(item.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Face Details */}
                          {item.facesDetected > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <p className="text-xs font-semibold text-blue-800 mb-1">Detection Details:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.faceCoordinates.slice(0, 3).map((face, idx) => (
                                  <span key={idx} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                    Face {idx + 1}: {face.width}×{face.height}px
                                  </span>
                                ))}
                                {item.faceCoordinates.length > 3 && (
                                  <span className="bg-blue-300 text-blue-900 px-2 py-1 rounded text-xs font-bold">
                                    +{item.faceCoordinates.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(item.resultImage)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;