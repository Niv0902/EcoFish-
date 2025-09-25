import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const tabs = [
  { key: 'pca', label: 'PCA Biplot' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'states', label: 'Kinneret States & Timeline' }
];

const images = {
  pca: [
    { src: '/assets/PCAbiplot.png', alt: 'PCA Biplot' }
  ],
  scenarios: [
    { src: '/assets/Scenarios.png', alt: 'Scenarios' }
  ],
  states: [
    { src: '/assets/InitialStates.png', alt: 'Initial States' },
    { src: '/assets/FinalStates.png', alt: 'Final States' },
    { src: '/assets/kineret_firebase_2010_2023.gif', alt: 'Kinneret Timeline' }
  ]
};

const PollutionEstimates = () => {
  const [activeTab, setActiveTab] = useState('pca');
  const [stateIdx, setStateIdx] = useState(0);

  // החלפת גרף בטאב states
  const handlePrev = () => {
    setStateIdx((prev) => (prev === 0 ? images.states.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setStateIdx((prev) => (prev === images.states.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
         <h1 className="text-5xl font-bold text-blue-800 mb-8 text-center">Pollution Estimates 📈</h1>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105
                    ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center gap-8">
          {activeTab === 'states' ? (
            <div className="flex flex-col items-center w-full">
              {/* Navigation Controls */}
              <div className="relative w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  {/* Image Container */}
                  <div>
                    <img
                      src={images.states[stateIdx].src}
                      alt={images.states[stateIdx].alt}
                      className="w-full h-auto"
                      style={{ minHeight: '400px', objectFit: 'contain' }}
                    />
                  </div>
                  
                  {/* Image Title and Indicators */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">
                        {images.states[stateIdx].alt}
                      </h3>
                      
                      {/* Page Indicators */}
                      <div className="flex space-x-2">
                        {images.states.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setStateIdx(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300
                              ${index === stateIdx 
                                ? 'bg-cyan-500 shadow-lg scale-125' 
                                : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((stateIdx + 1) / images.states.length) * 100}%` }}
                      />
                    </div>
                    
                    {/* Navigation Controls in Center */}
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        onClick={handlePrev}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white
                                  p-3 rounded-full shadow-lg border border-gray-200
                                  transition-all duration-300 hover:scale-110 hover:shadow-xl
                                  group focus:outline-none focus:ring-4 focus:ring-cyan-200"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                      </button>
                      
                      <div className="text-sm text-gray-600 font-medium">
                        {stateIdx + 1} of {images.states.length}
                      </div>
                      
                      <button
                        onClick={handleNext}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white
                                  p-3 rounded-full shadow-lg border border-gray-200
                                  transition-all duration-300 hover:scale-110 hover:shadow-xl
                                  group focus:outline-none focus:ring-4 focus:ring-cyan-200"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            images[activeTab].map(img => (
              <div key={img.src} className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-auto"
                    style={{ minHeight: '400px', objectFit: 'contain' }}
                  />
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-800 text-center">
                      {img.alt}
                    </h3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PollutionEstimates;