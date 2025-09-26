import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TimelineLegend from './TimelineLegend';
import PollutionSources from './PollutionSources';
import InteractiveYearlyAnalysis from './YearlyAnalysis';
import DownloadComponent from './DownloadComponent';
import TimelineColorLegend from './TimelineColorLegend';

const categories = {
  analysis: {
    label: 'Data Analysis',
    icon: '📊',
    color: 'blue',
    image: { src: '/assets/PCAbiplot.png', alt: 'PCA Biplot Analysis' }
  },
  scenarios: {
    label: 'Scenarios',
    icon: '🌊',
    color: 'green',
    image: { src: '/assets/Scenarios.png', alt: 'Environmental Scenarios' }
  },
  timeline: {
    label: 'Lake States',
    icon: '⏱️',
    color: 'purple',
    images: [
      { src: '/assets/InitialStates.png', alt: 'Initial Water Quality States' },
      { src: '/assets/FinalStates.png', alt: 'Final Water Quality States' },
      { src: '/assets/kineret_firebase_2010_2023.gif', alt: 'Lake Kinneret Environmental Timeline' }
    ]
  }
};

const PollutionEstimates = () => {
  const [activeCategory, setActiveCategory] = useState('analysis');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setTimelineIndex(0);
    setShowDetails(false);
  };

  const handlePrev = () => {
    setTimelineIndex((prev) => 
      prev === 0 ? categories.timeline.images.length - 1 : prev - 1
    );
    setShowDetails(false);
  };

  const handleNext = () => {
    setTimelineIndex((prev) => 
      prev === categories.timeline.images.length - 1 ? 0 : prev + 1
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
      purple: {
        active: 'bg-purple-600 text-white border-purple-700 shadow-lg',
        inactive: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
      }
    };
    return colors[color][active ? 'active' : 'inactive'];
  };

  const getCurrentImage = () => {
    if (activeCategory === 'timeline') {
      return categories.timeline.images[timelineIndex];
    }
    return categories[activeCategory].image;
  };

  const isTimelineAnimation = activeCategory === 'timeline' && timelineIndex === 2;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                    <p className="text-sm text-green-800 mb-2">
                      <strong>PCA Biplot Analysis:</strong> Shows relationships between environmental variables and temporal changes (2010-2023).
                    </p>
                    <div className="text-xs text-green-700 space-y-1 text-center">
                  <p><strong>Main trends:</strong> Early years (2010–2014) are clustered together, while later years (2020–2023) are more scattered</p>
<p><strong>Positive links:</strong> E.coli, Flood, and Chloride rise together, and Depth is strongly linked with Zinc.</p>
<p><strong>Negative links:</strong> High Lake Level means less E.coli and Chloride, while Lead drops when Depth and Zinc are high.</p>
<p><strong>Weak links:</strong> Lake Level vs. Depth/Zinc and Chloride vs. Lead show almost no connection.</p>
<p><strong>Conclusion:</strong> The environmental system has become less stable over time, with larger fluctuations in pollution</p>

                    </div>
                  </div>
                )}
{activeCategory === 'scenarios' && (
  <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
    <TimelineColorLegend />
<div className="text-sm text-green-800 mb-2 mt-4 space-y-2">
  <p><strong>Baseline:</strong> Stable and relatively clean state. At the start, pollution levels are low, with a slight increase over time, but the lake remains mostly light blue.</p>  
  <p><strong>Stress:</strong> Pollution spreads and intensifies. It starts with low levels, then rises sharply, covering large areas in red at maximum impact.</p>  
  <p><strong>Recovery:</strong> Begins from a polluted (red) state. With treatment and restoration, pollution gradually decreases, shifting to green/blue colors that represent cleaner and diluted conditions.</p>  
</div>
  </div>
)}


                {/* Initial States Explanation */}
                {activeCategory === 'timeline' && timelineIndex === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Initial States (2010):</strong> Baseline environmental conditions showing the spatial distribution of E.coli, heavy metals (Pb, Zn), chloride, flood impact, lake depth, and height across Lake Kinneret before deterioration began.
                    </p>
                  </div>
                )}

                {/* Final States Explanation */}
                {activeCategory === 'timeline' && timelineIndex === 1 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Final States (2023):</strong> Deteriorated conditions after 13 years showing increased E.coli contamination, elevated heavy metal concentrations, higher chloride levels, and expanded pollution zones. Clean areas decreased from 83.4% to 69.7% while critical areas increased from 0.3% to 2.5%.
                    </p>
                  </div>
                )}
                
                {/* Arrow navigation for timeline category */}
                {activeCategory === 'timeline' && (
                  <div className="mt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-purple-600" />
                    </button>
                    
                    <div className="flex space-x-2">
                      {categories.timeline.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setTimelineIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === timelineIndex 
                              ? 'bg-purple-500 shadow-lg scale-125' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-purple-600" />
                    </button>
                  </div>
                )}

                {/* Contextual Download Buttons */}
                <DownloadComponent 
                  currentImage={getCurrentImage()}
                  activeCategory={activeCategory}
                  timelineIndex={timelineIndex}
                  isTimelineAnimation={isTimelineAnimation}
                />
              </div>

              {/* Timeline animation specific content */}
              {isTimelineAnimation && (
                <div className="w-full mt-6">
                  <TimelineLegend />
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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