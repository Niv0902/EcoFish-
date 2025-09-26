import React, { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Import components
import ChemicalChart from './ChemicalChart.jsx';
import HeavyMetalsChart from './HeavyMetalsChart.jsx';
import YearlyTrendsChart from './YearlyTrendsChart.jsx';
import CorrelationScatter from './CorrelationScatter.jsx';
import ChemicalExtremesBar from './ChemicalExtremesBar.jsx';
import { useEnvironmentalData } from '../services/useEnvironmentalData.js';
import EcoliBeachLineChart from './EcoliBeachLineChart.jsx';
import HeavyMetalsThresholdsChart from './HeavyMetalsThresholdsChart.jsx';
import EcoliFloodYearChart from './EcoliFloodYearChart.jsx';
import KineretHeightChemScatter from './KineretHeightChemScatter.jsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatisticsDashboard = () => {
  const { chartData, loading } = useEnvironmentalData();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('chemicals');
  const [activeChart, setActiveChart] = useState('chemicals');
  
  // Define categories and their tabs
  const categories = {
    chemicals: {
      label: 'Chemicals',
      icon: '💧',
      color: 'green',
      tabs: [
        { id: 'chemicals', label: 'Chemicals Data' },
        { id: 'heightChem', label: 'Height vs Chemicals' },
        { id: 'extremes', label: 'Chemical Extremes' }
      ]
    },
    ecoli: {
      label: 'E.coli & Floods',
      icon: '🦠',
      color: 'blue',
      tabs: [
        { id: 'ecoliBeachLine', label: 'E.coli Beach Line & Stations' },
        { id: 'ecoliFloodYear', label: 'E.coli vs Floods' }
      ]
    },
    heavyMetals: {
      label: 'Heavy Metals',
      icon: '⚗️',
      color: 'red',
      tabs: [
        { id: 'metals', label: 'Heavy Metals by Depth' },
        { id: 'metalsThresholds', label: 'Heavy Metals Thresholds' }
      ]
    },
    combined: {
      label: 'Combined',
      icon: '📊',
      color: 'purple',
      tabs: [
        { id: 'scatter', label: 'Chloride vs E.coli' },
        { id: 'yearly', label: 'Pollutants Yearly Trends' }
      ]
    }
  };
  
  // Refs for chart cleanup
  const chartRefs = useRef({});

  // Cleanup function for charts
  useEffect(() => {
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          try {
            chart.destroy();
          } catch (e) {
            console.log('Chart cleanup:', e);
          }
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!hasAnimated && (chartData.chlorophyll?.length || chartData.nitrate?.length || chartData.beaches?.length || chartData.metals?.length)) {
      // mark after first population so next renders skip animation
      const t = setTimeout(() => setHasAnimated(true), 1200); // allow initial chart animation to finish
      return () => clearTimeout(t);
    }
  }, [chartData, hasAnimated]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Set the first tab of the category as active
    const firstTab = categories[categoryId].tabs[0];
    setActiveChart(firstTab.id);
  };

  // Handle tab change within category
  const handleTabChange = (tabId) => {
    setActiveChart(tabId);
  };

  // Get color classes for different states
  const getColorClasses = (color, active = false) => {
    const colors = {
      green: {
        active: 'bg-green-600 text-white border-green-700 shadow-lg',
        inactive: 'bg-white text-green-700 border-green-300 hover:bg-green-50'
      },
      blue: {
        active: 'bg-blue-600 text-white border-blue-700 shadow-lg',
        inactive: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
      },
      red: {
        active: 'bg-red-600 text-white border-red-700 shadow-lg',
        inactive: 'bg-white text-red-700 border-red-300 hover:bg-red-50'
      },
      purple: {
        active: 'bg-purple-600 text-white border-purple-700 shadow-lg',
        inactive: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
      }
    };
    return colors[color][active ? 'active' : 'inactive'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Environmental Data</h2>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-800 mb-3">EcoFish Analytics 🌊</h1>
          <p className="text-xl text-gray-600">Environmental Data Visualization Dashboard</p>
          <div className="w-60 md:w-100 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>

        {/* Statistics Overview - Hidden for E.coli category */}
        {activeCategory !== 'ecoli' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Analysis</h3>
                  <p className="text-4xl font-bold text-green-600">{(chartData.chlorophyll?.length || 0) + (chartData.nitrate?.length || 0) + (chartData.nitrit?.length || 0)}</p>
                  <p className="text-gray-500 mt-1">{(chartData.chlorophyll?.length || 0)} Chlorophyll + {(chartData.nitrate?.length || 0)} Nitrate + {(chartData.nitrit?.length || 0)} Nitrite samples</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💧</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Bacterial Analysis</h3>
                  <p className="text-4xl font-bold text-blue-600">{chartData.beaches?.length || 0}</p>
                  <p className="text-gray-500 mt-1">{chartData.beaches?.length || 0} beach monitoring locations</p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🦠</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Heavy Metals</h3>
                  <p className="text-4xl font-bold text-red-600">{chartData.metals?.length || 0}</p>
                  <p className="text-gray-500 mt-1">{chartData.metals?.length || 0} different metal types detected</p>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚗️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 justify-center mb-4">
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

          {/* Sub-tabs for active category */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories[activeCategory].tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  activeChart === tab.id 
                    ? getColorClasses(categories[activeCategory].color, true)
                    : getColorClasses(categories[activeCategory].color, false)
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Single Chart Container */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 pt-0 min-h-[800px] md:min-h-[800px] w-full md:w-[90%] mx-auto flex flex-col items-stretch">
          {activeChart === 'chemicals' && (
            <ChemicalChart chartData={chartData} hasAnimated={hasAnimated} />
          )}

          {activeChart === 'heightChem' && (
            <KineretHeightChemScatter dataArr={chartData.chemicalHeightArr || []} />
          )}

          {activeChart === 'extremes' && (
            <ChemicalExtremesBar chartData={chartData} />
          )}

          {activeChart === 'ecoliBeachLine' && (
            <EcoliBeachLineChart beaches={chartData.beaches || []} />
          )}

          {activeChart === 'ecoliFloodYear' && (
            <EcoliFloodYearChart beaches={chartData.beaches || []} />
          )}

          {activeChart === 'metals' && (
            <HeavyMetalsChart chartData={chartData} hasAnimated={hasAnimated} />
          )}

          {activeChart === 'metalsThresholds' && (
            <HeavyMetalsThresholdsChart metalsThresholds={chartData.metalsThresholds || []} />
          )}

          {activeChart === 'scatter' && (
            <CorrelationScatter chartData={chartData} />
          )}

          {activeChart === 'yearly' && (
            <YearlyTrendsChart chartData={chartData} hasAnimated={hasAnimated} />
          )}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default StatisticsDashboard;