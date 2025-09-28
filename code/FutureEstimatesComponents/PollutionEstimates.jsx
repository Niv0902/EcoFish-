import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimelineLegend from './TimelineLegend';
import PollutionSources from './PollutionSources';
import InteractiveYearlyAnalysis from './YearlyAnalysis';
import DownloadComponent from './DownloadComponent';
import TimelineColorLegend from './TimelineColorLegend';

// Import all images and GIFs
import PCAbiplot from '../assets/PCAbiplot.png';
import Scenarios from '../assets/Scenarios.png';
import CSR from '../assets/CSR.png';
import InitialStates from '../assets/InitialStates.png';
import FinalStates from '../assets/FinalStates.png';
import TimelineGif from '../assets/kineret_firebase_2010_2023.gif';
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
  timeline: {
    label: 'Timeline States',
    icon: '⏱️',
    color: 'purple',
    images: [
      { src: InitialStates, alt: 'Initial Water Quality States (2010)' },
      { src: FinalStates, alt: 'Final Water Quality States (2023)' },
      { src: TimelineGif, alt: 'Lake Kinneret Environmental Timeline' }
    ]
  },
  cellular: {
    label: 'Cellular Automata',
    icon: '🎮',
    color: 'indigo',
    images: [
      { src: cellularGif, alt: 'Game of Life Environmental Model' }
    ]
  }
};

const PollutionEstimates = () => {
  const [activeCategory, setActiveCategory] = useState('analysis');
  const [imageIndex, setImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setImageIndex(0);
    setShowDetails(false);
  };

  const handlePrev = () => {
    const currentImages = categories[activeCategory].images || [categories[activeCategory].image];
    setImageIndex((prev) => 
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
    setShowDetails(false);
  };

  const handleNext = () => {
    const currentImages = categories[activeCategory].images || [categories[activeCategory].image];
    setImageIndex((prev) => 
      prev === currentImages.length - 1 ? 0 : prev + 1
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
      },
      indigo: {
        active: 'bg-indigo-600 text-white border-indigo-700 shadow-lg',
        inactive: 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
      }
    };
    return colors[color][active ? 'active' : 'inactive'];
  };

  const getCurrentImage = () => {
    if (categories[activeCategory].images) {
      return categories[activeCategory].images[imageIndex];
    }
    return categories[activeCategory].image;
  };

  const hasMultipleImages = () => {
    return categories[activeCategory].images && categories[activeCategory].images.length > 1;
  };

  const isTimelineAnimation = activeCategory === 'timeline' && imageIndex === 2;
  const isCellularAnimation = activeCategory === 'cellular';

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">PCA Analysis</h3>
                <p className="text-4xl font-bold text-blue-600">8</p>
                <p className="text-gray-500 mt-1">Parameters analyzed (inc. Nitrate)</p>
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">Timeline Data</h3>
                <p className="text-4xl font-bold text-purple-600">14</p>
                <p className="text-gray-500 mt-1">Years of monitoring (2010-2023)</p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-indigo-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Cellular Model</h3>
                <p className="text-4xl font-bold text-indigo-600">101</p>
                <p className="text-gray-500 mt-1">Simulation steps (Game of Life)</p>
              </div>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎮</span>
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
                      <strong>PCA Biplot Analysis:</strong> Shows relationships between environmental variables and temporal changes (2010-2023) INCLUDING NITRATE.
                    </p>
                    <div className="text-xs text-green-700 space-y-1 text-center">
                      <p><strong>Main trends:</strong> Early years (2010–2014) are clustered together, while later years (2020–2023) are more scattered</p>
                      <p><strong>Positive links:</strong> E.coli, Flood, Nitrate and Chloride rise together, and Depth is strongly linked with Zinc.</p>
                      <p><strong>Negative links:</strong> High Lake Level means less E.coli and Chloride, while Lead drops when Depth and Zinc are high.</p>
                      <p><strong>Nitrate patterns:</strong> Shows agricultural influence with seasonal variations and correlation with other pollution indicators</p>
                      <p><strong>Conclusion:</strong> The environmental system has become less stable over time, with larger fluctuations in pollution including nitrate levels</p>
                    </div>
                  </div>
                )}

                {/* CSR Spatial Analysis Explanation */}
                {activeCategory === 'spatial' && (
                  <div className="mt-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 mb-2">
                      <strong>CSR Point Pattern Analysis:</strong> Complete Spatial Randomness analysis using real environmental data from Firebase database INCLUDING NITRATE.
                    </p>
                    <div className="text-xs text-orange-700 space-y-1 text-center">
                      <p><strong>Data Sources:</strong> Chemicals (Chloride, Nitrate), Heavy Metals (Zn, Pb, Cu), and E.coli measurements</p>
                      <p><strong>Spatial Distribution:</strong> 200 randomly positioned points with colors representing normalized environmental parameter values</p>
                      <p><strong>Nitrate Analysis:</strong> Agricultural pollution patterns showing concentration in specific lake areas</p>
                      <p><strong>Key Finding:</strong> 80% of measurements show low pollution levels (purple), with scattered high-value hotspots (green/yellow)</p>
                      <p><strong>Environmental Status:</strong> Generally manageable pollution levels with occasional contamination events across the lake</p>
                      <p><strong>Limitation:</strong> Random coordinates don't reflect actual lake geography - used for statistical pattern analysis only</p>
                    </div>
                  </div>
                )}

                {/* Scenarios Explanation */}
                {activeCategory === 'scenarios' && (
                  <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <TimelineColorLegend />
                    <div className="text-sm text-green-800 text-left mb-2 mt-4 space-y-2">
                        <p><strong>Baseline Scenario:</strong> Uses measured environmental data as reference point with normalized values ranging 0.1-0.4. Lake level calculations remain unmodified, representing normal environmental conditions with typical pollution loads from agricultural runoff, urban discharge, and natural processes.</p>

                        <p><strong>Stress Scenario:</strong> Amplifies all pollution parameters by 2-3x (values range 0.4-1.2) while reducing lake level by 15% to simulate drought conditions. This combined effect creates higher pollutant concentrations due to both increased contamination sources and reduced dilution capacity, representing worst-case environmental conditions.</p>

                        <p><strong>Recovery Scenario:</strong> Reduces pollution sources by 40-60% (values return to 0.1-0.4 range) and increases lake level by 5% to simulate improved water management. Additional treatment zones provide 15-50% reduction in managed areas, representing active environmental restoration with treatment interventions.</p>

                        <p><strong>Parameter Weighting System:</strong> Weights were determined through comprehensive literature review of water quality standards and environmental health studies. E.coli receives highest priority at 25% based on WHO drinking water guidelines and immediate human health risks. Lead follows at 20% according to EPA toxicity classifications and bioaccumulation research. Chloride and nitrate each receive 15% as established in OECD water quality frameworks as key chemical indicators of salinity and agricultural pollution respectively. Flood impact gets 15% based on environmental amplification studies showing how extreme weather events intensify pollution dispersal. Zinc receives lowest weight at 10% following environmental toxicology literature indicating lower immediate toxicity compared to lead.</p>

                        <p><strong>Environmental Multipliers:</strong> Depth factor adds up to 30% increase based on sediment chemistry studies showing heavy metal accumulation patterns in lake systems. Lake level factor creates concentration effects following fundamental dilution principles documented in limnology research, doubling pollution impact during low water periods while providing dilution during high water periods.</p>

                        <p><strong>Mathematical Integration:</strong> The model multiplies scenario scaling factors by literature-based parameter weights, then applies environmental multipliers to calculate final pollution indices. However, this approach can produce values exceeding 1.0 because the 100% weight total gets multiplied by environmental factors up to 2.6x, potentially breaking the discrete state mapping system established in cellular automata literature.</p> 
                    </div>
                  </div>
                )}

                {/* Timeline States Explanation */}
                {activeCategory === 'timeline' && imageIndex === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Initial States (2010):</strong> Baseline environmental conditions showing the spatial distribution of E.coli, heavy metals (Pb, Zn), chloride, nitrate, flood impact, lake depth, and height across Lake Kinneret before deterioration began.
                    </p>
                  </div>
                )}

                {activeCategory === 'timeline' && imageIndex === 1 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Final States (2023):</strong> Deteriorated conditions after 13 years showing increased E.coli contamination, elevated heavy metal concentrations, higher chloride and nitrate levels, and expanded pollution zones. Clean areas decreased from 83.4% to 69.7% while critical areas increased from 0.3% to 2.5%.
                    </p>
                  </div>
                )}

                {/* Cellular Automata Explanation */}
                {activeCategory === 'cellular' && (
                  <div className="mt-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-800 mb-2">
                      <strong>Cellular Automata Model:</strong> Game of Life-inspired model for spatial dynamics analysis using Lake Kinneret environmental data INCLUDING NITRATE as initial conditions.
                    </p>
                    <div className="text-xs text-indigo-700 space-y-1 text-center">
                      <div>
                        <p><strong>Initial State:</strong> 347 living cells (14.5%) based on 8 Lake Kinneret parameters including nitrate</p>
                        <p><strong>Final State:</strong> 119 living cells (5%) after 101 simulation steps</p>
                        
                        <h4>🔬 Data Used from Lake Kinneret:</h4>
                        <p><strong>All 8 Parameters:</strong> E.coli, Lake Level, Lead, Flood Events, Zinc, Depth, Chloride, Nitrate</p>
                        <p><strong>Nitrate Integration:</strong> Agricultural pollution patterns affecting cellular evolution (15% weight)</p>
                        <p><strong>Multi-Factor Analysis:</strong> Cell becomes "alive" if 3+ parameters exceed thresholds OR critical pollution detected</p>
                        <p><strong>Key Result:</strong> 66% decline in problematic areas, showing lake's natural recovery capacity</p>
                        <p><strong>Conclusion:</strong> Majority of lake area shows acceptable conditions most of the time</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Arrow navigation for categories with multiple images */}
                {hasMultipleImages() && (
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrev}
                      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                        activeCategory === 'timeline' 
                          ? 'bg-purple-100 hover:bg-purple-200' 
                          : 'bg-indigo-100 hover:bg-indigo-200'
                      }`}
                    >
                      <ChevronLeft className={`w-5 h-5 ${
                        activeCategory === 'timeline' ? 'text-purple-600' : 'text-indigo-600'
                      }`} />
                    </button>
                    
                    <div className="flex space-x-2">
                      {(categories[activeCategory].images || []).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === imageIndex 
                              ? `shadow-lg scale-125 ${
                                  activeCategory === 'timeline' ? 'bg-purple-500' : 'bg-indigo-500'
                                }` 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNext}
                      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                        activeCategory === 'timeline' 
                          ? 'bg-purple-100 hover:bg-purple-200' 
                          : 'bg-indigo-100 hover:bg-indigo-200'
                      }`}
                    >
                      <ChevronRight className={`w-5 h-5 ${
                        activeCategory === 'timeline' ? 'text-purple-600' : 'text-indigo-600'
                      }`} />
                    </button>
                  </div>
                )}

                {/* Contextual Download Buttons */}
                <DownloadComponent 
                  currentImage={getCurrentImage()}
                  activeCategory={activeCategory}
                  imageIndex={imageIndex}
                  isTimelineAnimation={isTimelineAnimation}
                  isCellularAnimation={isCellularAnimation}
                />
              </div>

              {/* Timeline animation specific content */}
              {isTimelineAnimation && (
                <div className="w-full mt-6">
                  <TimelineLegend />
                  
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                    >
                      {showDetails ? 'Hide Interactive Analysis' : 'Show Interactive Analysis'}
                    </button>
                  </div>

                  {showDetails && (
                    <div className="mt-6 space-y-6">
                      <PollutionSources />
                      <InteractiveYearlyAnalysis />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutionEstimates;
