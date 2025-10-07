import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimelineLegend from './TimelineLegend';
import PollutionSources from './PollutionSources';
import InteractiveYearlyAnalysis from './YearlyAnalysis';
import DownloadComponent from './DownloadComponent';
import TimelineColorLegend from './TimelineColorLegend';
import ScenarioVisualizer from './ScenarioVisualizer';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';

// Import all images and GIFs
import PCAbiplot from '../assets/PCAbiplot.png';
import Scenarios from '../assets/Scenarios.png';
import CSR from '../assets/CSR.png';
import InitialStates from '../assets/InitialStates.png';
import FinalStates from '../assets/FinalStates.png';
import TimelineGif from '../assets/kineret_firebase_2010_2023.gif';

const categories = {
  analysis: {
    label: 'PCA biplot Analysis',
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
    label: 'Environmental Cellular Automata',
    icon: '⏱️',
    color: 'purple',
    images: [
      { src: InitialStates, alt: 'Initial Water Quality States (2010)' },
      { src: FinalStates, alt: 'Final Water Quality States (2023)' },
      { src: TimelineGif, alt: 'Lake Kinneret Environmental Timeline' }
    ]
  },

};



const PollutionEstimates = () => {
  const [activeCategory, setActiveCategory] = useState('analysis');
  const [imageIndex, setImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [firebaseData, setFirebaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);

  // Load Firebase data
  useEffect(() => {
    const dataRef = ref(db, '/');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      setFirebaseData(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setImageIndex(0);
    setShowDetails(false);
    setShowSimulator(false); // Reset to methodology when switching categories
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
                    <p className="text-sm text-green-800 mb-2 text-left">
                      <strong>PCA Biplot Analysis:</strong> Shows relationships between environmental variables and temporal changes (2010-2023) INCLUDING NITRATE.
                    </p>
                    <div className="text-xs text-green-700 space-y-1 text-left">
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
                    <p className="text-sm text-orange-800 mb-2 text-left">
                      <strong>CSR Point Pattern Analysis:</strong> Complete Spatial Randomness analysis using real environmental data from Firebase database INCLUDING NITRATE.
                    </p>
                    <div className="text-xs text-orange-700 space-y-1 text-left">
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
                    
                    {/* Download Button for Scenarios */}
                    <div className="flex justify-center mt-4 mb-2">
                      <DownloadComponent 
                        currentImage={getCurrentImage()}
                        activeCategory={activeCategory}
                        imageIndex={imageIndex}
                        isTimelineAnimation={isTimelineAnimation}
                      />
                    </div>
                    
                    {/* Arrow Navigation for Scenarios */}
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setShowSimulator(false)}
                        className="p-2 rounded-full transition-all duration-300 hover:scale-110 bg-green-100 hover:bg-green-200"
                      >
                        <ChevronLeft className="w-5 h-5 text-green-600" />
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSimulator(false)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            !showSimulator 
                              ? 'shadow-lg scale-125 bg-green-500' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                        <button
                          onClick={() => setShowSimulator(true)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            showSimulator 
                              ? 'shadow-lg scale-125 bg-green-500' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      </div>
                      
                      <button
                        onClick={() => setShowSimulator(true)}
                        className="p-2 rounded-full transition-all duration-300 hover:scale-110 bg-green-100 hover:bg-green-200"
                      >
                        <ChevronRight className="w-5 h-5 text-green-600" />
                      </button>
                    </div>

                    {/* Scientific Methodology Content */}
                    {!showSimulator && (
                      <div>
                        <div className="text-sm text-left text-green-800 mb-2 mt-4 space-y-2">
                      <p><strong>Interactive Scenario Modeling:</strong> Manipulate parameter weights and see dramatic differences between baseline, stress, and recovery scenarios using real Firebase data.</p>  
                      <p><strong>Baseline:</strong> Normal pollution levels with moderate contamination from all sources.</p>  
                      <p><strong>Stress:</strong> Extreme pollution (4-6× baseline) simulating drought + heavy contamination.</p>  
                      <p><strong>Recovery:</strong> Active treatment reducing pollution to 30-50% of baseline levels.</p>  
                    </div>

                    {/* Parameter Weights Scientific Explanation */}
                    <div className="mt-6 p-5 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                      <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                       Scientific Parameter Weight Methodology <span>⚖️</span> 
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Weight Values */}
                        <div className="space-y-3">
                          <h5 className="font-semibold text-blue-700 text-base">Optimized Weight Distribution:</h5>
                          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-red-700">⚡ Heavy Metals:</span>
                              <span className="font-mono font-bold text-red-600">0.28 (28%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-blue-700">🧂 Chloride:</span>
                              <span className="font-mono font-bold text-blue-600">0.20 (20%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-700">🌱 Nitrate:</span>
                              <span className="font-mono font-bold text-green-600">0.15 (15%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-purple-700">🦠 E.coli:</span>
                              <span className="font-mono font-bold text-purple-600">0.12 (12%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-cyan-700">🌊 Flood Risk:</span>
                              <span className="font-mono font-bold text-cyan-600">0.12 (12%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">💧 Water Level:</span>
                              <span className="font-mono font-bold text-gray-600">0.08 (8%)</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-indigo-700">📏 Lake Depth:</span>
                              <span className="font-mono font-bold text-indigo-600">0.05 (5%)</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-gray-800">Total:</span>
                                <span className="font-mono text-green-600">1.00 (100%)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Scientific Justification */}
                        <div className="space-y-4">
                          <h5 className="font-semibold text-blue-700 text-base">Weight Determination Methods:</h5>
                          
                          <div className="space-y-3">
                            <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                              <h6 className="font-bold text-red-800 text-sm">1. Toxicological Impact (Heavy Metals - 28%)</h6>
                              <p className="text-xs text-red-700 mt-1">
                                Highest weight due to bioaccumulation, persistence, and irreversible health effects. 
                                Based on WHO/EPA toxicity thresholds and ecosystem damage potential.
                              </p>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                              <h6 className="font-bold text-blue-800 text-sm">2. Ecosystem Critical Indicators (Chloride - 20%)</h6>
                              <p className="text-xs text-blue-700 mt-1">
                                Primary salinity measure affecting all aquatic life. Israeli Water Authority standards 
                                and Lake Kinneret's unique freshwater ecosystem sensitivity.
                              </p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                              <h6 className="font-bold text-green-800 text-sm">3. Agricultural Impact (Nitrate - 15%)</h6>
                              <p className="text-xs text-green-700 mt-1">
                                Eutrophication driver from fertilizer runoff. EU Nitrates Directive compliance 
                                and correlation analysis with other contamination sources.
                              </p>
                            </div>
                            
                            <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                              <h6 className="font-bold text-purple-800 text-sm">4. Health Risk Factors (E.coli, Flood - 12% each)</h6>
                              <p className="text-xs text-purple-700 mt-1">
                                Immediate public health threats. WHO recreational water guidelines and 
                                flood amplification effects on contamination spread.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Scenario Impact Explanation */}
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                        <h6 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-1">
                          How Weights Affect Scenario Calculations? <span>📊</span>
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-blue-100 p-2 rounded">
                            <p><strong>Baseline Scenario:</strong></p>
                            <p>Moderate values (0.15-0.30) × weights = Normal pollution index (0.2-0.5)</p>
                          </div>
                          <div className="bg-red-100 p-2 rounded">
                            <p><strong>Stress Scenario:</strong></p>
                            <p>High values (0.80-1.50) × weights = Critical pollution index (1.5-8.0)</p>
                          </div>
                          <div className="bg-green-100 p-2 rounded">
                            <p><strong>Recovery Scenario:</strong></p>
                            <p>Low values (0.05-0.20) × weights = Minimal pollution index (0.08-0.3)</p>
                          </div>
                        </div>
                        <p className="text-xs text-yellow-700 mt-2">
                          <strong>Weight Impact:</strong> Heavy metals (28% weight) dominate the pollution index calculation, 
                          making metal contamination the primary driver of environmental risk assessment.
                        </p>
                      </div>
                        </div>
                      </div>
                    )}

                    {/* Environmental Scenario Simulator Content */}
                    {showSimulator && (
                      <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <h4 className="text-xl font-bold text-green-800 mb-4 text-center flex items-center justify-center gap-2">
                          <span>🌊</span>
                          Environmental Scenario Simulator
                        </h4>
                        
                        {!loading && firebaseData && (
                          <ScenarioVisualizer data={firebaseData} />
                        )}
                        
                        {loading && (
                          <div className="text-center py-8 text-gray-500">
                            Loading Firebase data for scenarios...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline States Explanation */}
                {activeCategory === 'timeline' && imageIndex === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 text-left">
                      <strong>Initial States (2010):</strong> Baseline environmental conditions showing the spatial distribution of E.coli, heavy metals (Pb, Zn), chloride, nitrate, flood impact, lake depth, and height across Lake Kinneret before deterioration began.
                    </p>
                  </div>
                )}

                {activeCategory === 'timeline' && imageIndex === 0 && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                    <p className="text-xs text-blue-700">
                      <strong>Parameter Weights:</strong> This Environmental Cellular Automata analysis uses scientifically validated parameter weights: Heavy Metals (28%), Chloride (20%), Nitrate (15%), E.coli (12%), Flood (12%), Water Level (8%), Lake Depth (5%). These weights are consistently applied across all scenario analyses.
                    </p>
                  </div>
                )}

                {activeCategory === 'timeline' && imageIndex === 1 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800 text-left">
                      <strong>Final States (2023):</strong> Deteriorated conditions after 13 years showing increased E.coli contamination, elevated heavy metal concentrations, higher chloride and nitrate levels, and expanded pollution zones. Clean areas decreased from 83.4% to 69.7% while critical areas increased from 0.3% to 2.5%.
                    </p>
                  </div>
                )}

                {activeCategory === 'timeline' && imageIndex === 1 && (
                  <div className="mt-3 p-3 bg-white rounded border border-orange-300">
                    <p className="text-xs text-orange-700">
                      <strong>Parameter Weights:</strong> The Environmental Cellular Automata model applies the same parameter weighting system: Heavy Metals (28%), Chloride (20%), Nitrate (15%), E.coli (12%), Flood (12%), Water Level (8%), Lake Depth (5%). This ensures consistent pollution index calculations across all temporal analyses.
                    </p>
                  </div>
                )}


                
                {/* Arrow navigation for categories with multiple images */}
                {hasMultipleImages() && (
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-full transition-all duration-300 hover:scale-110 bg-purple-100 hover:bg-purple-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-purple-600" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {(categories[activeCategory].images || []).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === imageIndex 
                              ? 'shadow-lg scale-125 bg-purple-500' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-full transition-all duration-300 hover:scale-110 bg-purple-100 hover:bg-purple-200"
                    >
                      <ChevronRight className="w-5 h-5 text-purple-600" />
                    </button>
                  </div>
                )}

                {/* Contextual Download Buttons - Only for non-scenarios */}
                {activeCategory !== 'scenarios' && (
                  <DownloadComponent 
                    currentImage={getCurrentImage()}
                    activeCategory={activeCategory}
                    imageIndex={imageIndex}
                    isTimelineAnimation={isTimelineAnimation}
                  />
                )}
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
