import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token } = useAuth();

  if (token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 animate-gradient bg-[length:200%_200%] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow delay-1000"></div>
        </div>

        <div className="text-center text-white z-10 px-4">
          <div className="animate-float mb-8">
            <div className="text-8xl mb-4">🎯</div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Smart Vision
          </h1>
          <p className="text-2xl md:text-3xl mb-8 text-blue-100">AI-Powered Face Detection</p>
          <Link 
            to="/dashboard" 
            className="group inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Go to Dashboard
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 animate-gradient bg-[length:200%_200%] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse-slow delay-500"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow delay-1000"></div>
      </div>

      <div className="text-center text-white z-10 px-4 max-w-4xl">
        <div className="animate-float mb-8">
          <div className="text-9xl mb-6">👁️</div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
          Smart Vision
        </h1>
        
        <p className="text-2xl md:text-3xl mb-4 text-blue-100 font-light">
          Advanced AI Face Detection Technology
        </p>
        
        <p className="text-lg md:text-xl mb-12 text-blue-200 max-w-2xl mx-auto">
          Detect multiple faces instantly with cutting-edge computer vision. Upload images or use your webcam for real-time analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to="/login" 
            className="group w-64 bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Login</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
          
          <Link 
            to="/register" 
            className="group w-64 border-2 border-white text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-white hover:text-blue-600 hover:shadow-2xl hover:scale-110 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-blue-100">Instant face detection in milliseconds</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Multiple Faces</h3>
            <p className="text-blue-100">Detect unlimited faces in one image</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-blue-100">Your data is encrypted and protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;