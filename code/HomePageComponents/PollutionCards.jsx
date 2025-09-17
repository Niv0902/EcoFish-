import React from 'react';
import { Droplets, Waves } from 'lucide-react';

const PollutionCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-16 max-w-6xl mx-auto px-4">
      <div className="col-span-1 md:col-span-2 group bg-red-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-500 border border-red-300/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 animate-pulse"></div>
        <div className="relative">
          <h3 className="text-xl font-black mb-4 text-red-800 flex items-center justify-center tracking-wide drop-shadow-md">
            Heavy Metals <Droplets className="w-6 h-6 text-red-600 animate-bounce ml-2" />
          </h3>
          <p className="text-base text-red-700 font-semibold text-center tracking-wide">
            Critical contamination levels detected in lake water
          </p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-3 group bg-green-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-500 border border-green-300/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-yellow-500/20 animate-pulse"></div>
        <div className="relative">
          <h3 className="text-xl font-black mb-4 text-green-800 flex items-center justify-center tracking-wide drop-shadow-md">
            Chemical Levels 
            <div className="relative w-6 h-6 ml-2">
              {/* Test tube icon */}
              <div className="w-6 h-6 relative">
                {/* Test tube body */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-gradient-to-t from-green-600 to-green-400 rounded-b-lg opacity-90"></div>
                {/* Test tube liquid */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-t from-yellow-400 to-green-300 rounded-b-lg animate-pulse"></div>
                {/* Test tube rim */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-400 rounded-t-sm"></div>
                {/* Bubbles effect */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-pulse"></div>
              </div>
            </div>
          </h3>
          <p className="text-base text-green-700 font-semibold text-center tracking-wide">
            Nitrates and chemical runoff monitoring system with comprehensive analysis of water quality parameters including seasonal variations and environmental impact assessments
          </p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 group bg-blue-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 border border-blue-300/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 animate-pulse"></div>
        <div className="relative">
          <h3 className="text-xl font-black mb-4 text-blue-800 flex items-center justify-center tracking-wide drop-shadow-md">
            Flood Impact <Waves className="w-6 h-6 text-blue-600 animate-bounce ml-2" />
          </h3>
          <p className="text-base text-blue-700 font-semibold text-center tracking-wide">
            E.coli contamination from flooding events
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollutionCards;