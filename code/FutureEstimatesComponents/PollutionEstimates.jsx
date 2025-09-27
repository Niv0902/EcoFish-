import React, { useState } from 'react';
import DownloadComponent from './DownloadComponent';

import PCAbiplot from '../assets/PCAbiplot.png';
import Scenarios from '../assets/Scenarios.png';
import CSR from '../assets/CSR.png';
import cellularGif from '../assets/GOF.gif';

const categories = {
  analysis: {
    label: 'Data Analysis',
    icon: '📊',
    color: 'blue',
    image: { src: PCAbiplot, alt: 'PCA Biplot Analysis' }
  },
  scenarios: {
    label: 'Scenarios',
    icon: '🌊',
    color: 'green',
    image: { src: Scenarios, alt: 'Environmental Scenarios' }
  },
  spatial: {
    label: 'Spatial Analysis',
    icon: '🗺️',
    color: 'orange',
    image: { src: CSR, alt: 'CSR Point Pattern Analysis' }
  },
  cellular: {
    label: 'Lake States',
    icon: '⏱️',
    color: 'purple',
    images: [
      { src: cellularGif, alt: 'Lake Kinneret Environmental cellular' }
    ]
  }
};


const PollutionEstimates = () => {
  const [activeCategory, setActiveCategory] = useState('analysis');
  const [cellularIndex, setcellularIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setcellularIndex(0);
    setShowDetails(false);
  };

  const handlePrev = () => {
    setcellularIndex((prev) => 
      prev === 0 ? categories.cellular.images.length - 1 : prev - 1
    );
    setShowDetails(false);
  };

  const handleNext = () => {
    setcellularIndex((prev) => 
      prev === categories.cellular.images.length - 1 ? 0 : prev + 1
    );
    setShowDetails(false);
  };

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: {
        active: 'bg-blue-600 text-white border-blue-700 shadow-lg',
        inactive: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
      },
      green: {
        active: 'bg-green-600 text-white border-green-700 shadow-lg',
        inactive: 'bg-white text-green-700 border-green-300 hover:bg-green-50'
      },
      orange: {
        active: 'bg-orange-600 text-white border-orange-700 shadow-lg',
        inactive: 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'
      },
      purple: {
        active: 'bg-purple-600 text-white border-purple-700 shadow-lg',
        inactive: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
      }
    };
    return colors[color][active ? 'active' : 'inactive'];
  };

  const getCurrentImage = () => {
    if (activeCategory === 'cellular') {
      return categories.cellular.images[cellularIndex];
    }
    return categories[activeCategory].image;
  };

  const iscellularAnimation = activeCategory === 'cellular' && cellularIndex === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-800 mb-3">Lake Kinneret Environmental Analysis 🌊</h1>
          <p className="text-xl text-gray-600">Comprehensive Water Quality Assessment Dashboard</p>
          <div className="w-60 md:w-100 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">PCA Analysis</h3>
                <p className="text-4xl font-bold text-blue-600">3</p>
                <p className="text-gray-500 mt-1">Data source components analyzed</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Scenarios</h3>
                <p className="text-4xl font-bold text-green-600">3</p>
                <p className="text-gray-500 mt-1">Environmental scenarios modeled</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🌊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-orange-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Spatial Points</h3>
                <p className="text-4xl font-bold text-orange-600">200</p>
                <p className="text-gray-500 mt-1">Random sampling points analyzed</p>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🗺️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">cellular Data</h3>
                <p className="text-4xl font-bold text-purple-600">14</p>
                <p className="text-gray-500 mt-1">Years of monitoring (2010-2023)</p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏱️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(categories).map(([categoryId, category]) => (
              <button
                key={categoryId}
                onClick={() => handleCategoryChange(categoryId)}
                className={`px-6 py-3 rounded-xl font-semibold text-lg border-2 transition-all transform hover:scale-105 flex items-center gap-2 ${
                  getColorClasses(category.color, activeCategory === categoryId)
                }`}
              >
                {category.label}
                <span className="text-xl">{category.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Single Chart Container */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 min-h-[600px] w-full md:w-[90%] mx-auto flex flex-col">
          {/* Image Display */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-4">
                <img
                  src={getCurrentImage().src}
                  alt={getCurrentImage().alt}
                  className="w-full h-auto"
                  style={{ minHeight: '400px', objectFit: 'contain' }}
                />
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {getCurrentImage().alt}
                </h3>
                
                {/* PCA Analysis Explanation */}
                {activeCategory === 'analysis' && (
                  <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>PCA Biplot Analysis:</strong> Shows relationships between environmental variables and temporal changes (2010-2023).
                    </p>
                    <div className="text-xs text-green-700 space-y-1 text-center">
                      <p><strong>Main trends:</strong> Early years (2010–2014) are clustered together, while later years (2020–2023) are more scattered</p>
                      <p><strong>Positive links:</strong> E.coli, Flood, Nitrate and Chloride rise together, and Depth is strongly linked with Zinc.</p>
                      <p><strong>Negative links:</strong> High Lake Level means less E.coli and Chloride, while Lead drops when Depth and Zinc are high.</p>
                      <p><strong>Weak links:</strong> Lake Level vs. Depth/Zinc and Chloride vs. Lead show almost no connection.</p>
                      <p><strong>Conclusion:</strong> The environmental system has become less stable over time, with larger fluctuations in pollution</p>
                    </div>
                  </div>
                )}
  {/* cellular Spatial Analysis Explanation */}
                {activeCategory === 'cellular' && (
  <div className="mt-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
    <p className="text-sm text-indigo-800 mb-2">
      <strong>Cellular Automata Model:</strong> Game of Life-inspired model for spatial dynamics analysis using Lake Kinneret E.coli data as initial conditions.
    </p>
    <div className="text-xs text-indigo-700 space-y-1 text-center">
     <div>
  <p><strong>Initial State:</strong> 347 living cells (14.5%) based on 7 Lake Kinneret parameters</p>
  <p><strong>Final State:</strong> 119 living cells (5%) after 101 simulation steps</p>
  
  <h4>🔬 Data Used from Lake Kinneret:</h4>
  <p><strong>All 7 Parameters:</strong> E.coli, Lake Level, Lead, Flood Events, Zinc, Depth, Nitrate</p>
  <p><strong>Multi-Factor Analysis:</strong> Cell becomes "alive" if 3+ parameters exceed thresholds OR critical pollution detected</p>
  <p><strong>Majority of lake area shows acceptable conditions most of the time- 66% decline in problematic areas</strong></p>
</div>
    </div>
  </div>
)}

                {/* CSR Spatial Analysis Explanation */}
                {activeCategory === 'spatial' && (
                  <div className="mt-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 mb-2">
                      <strong>CSR Point Pattern Analysis:</strong> Complete Spatial Randomness analysis using real environmental data from Firebase database.
                    </p>
                    <div className="text-xs text-orange-700 space-y-1 text-center">
                      <p><strong>Data Sources:</strong> Chemicals (Chloride, Nitrate), Heavy Metals (Zn, Pb, Cu), and E.coli measurements</p>
                      <p><strong>Spatial Distribution:</strong> 200 randomly positioned points with colors representing normalized environmental parameter values</p>
                      <p><strong>Key Finding:</strong> 80% of measurements show low pollution levels (purple), with scattered high-value hotspots (green/yellow)</p>
                      <p><strong>Environmental Status:</strong> Generally manageable pollution levels with occasional contamination events across the lake</p>
                      <p><strong>Limitation:</strong> Random coordinates don't reflect actual lake geography - used for statistical pattern analysis only</p>
                    </div>
                  </div>
                )}

                {/* Scenarios Explanation */}
                {activeCategory === 'scenarios' && (
                  <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <cellularColorLegend />
                    <div className="text-sm text-green-800 mb-2 mt-4 space-y-2">
                      <p><strong>Baseline:</strong> Stable and relatively clean state. At the start, pollution levels are low, with a slight increase over time, but the lake remains mostly light blue.</p>  
                      <p><strong>Stress:</strong> Pollution spreads and intensifies. It starts with low levels, then rises sharply, covering large areas in red at maximum impact.</p>  
                      <p><strong>Recovery:</strong> Begins from a polluted (red) state. With treatment and restoration, pollution gradually decreases, shifting to green/blue colors that represent cleaner and diluted conditions.</p>  
                    </div>
                  </div>
                )}
                


                {/* Contextual Download Buttons */}
                <DownloadComponent 
                  currentImage={getCurrentImage()}
                  activeCategory={activeCategory}
                  cellularIndex={cellularIndex}
                  iscellularAnimation={iscellularAnimation}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutionEstimates;