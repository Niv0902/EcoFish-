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
import EcoliHeatmap from './EcoliHeatmap.jsx';
import HeavyMetalsChart from './HeavyMetalsChart.jsx';
import YearlyTrendsChart from './YearlyTrendsChart.jsx';
import { useEnvironmentalData } from './useEnvironmentalData.js';

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
  const [activeChart, setActiveChart] = useState('chemicals'); // 'chemicals' | 'ecoli' | 'metals' | 'yearly'
  
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
    if (!hasAnimated && (chartData.chlorophyll.length || chartData.nitrate.length || chartData.beaches.length || chartData.metals.length)) {
      // mark after first population so next renders skip animation
      const t = setTimeout(()=>setHasAnimated(true), 1200); // allow initial chart animation to finish
      return () => clearTimeout(t);
    }
  }, [chartData, hasAnimated]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-800 mb-3">🌊 EcoFish Analytics</h1>
          <p className="text-xl text-gray-600">Environmental Data Visualization Dashboard</p>
          <div className="w-60 md:w-100 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>

        {/* Statistics Overview - Hidden for E.coli tab */}
        {activeChart !== 'ecoli' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Analysis</h3>
                  <p className="text-4xl font-bold text-green-600">{(chartData.chlorophyll?.length || 0) + (chartData.nitrate?.length || 0)}</p>
                  <p className="text-gray-500 mt-1">{(chartData.chlorophyll?.length || 0)} Chlorophyll + {(chartData.nitrate?.length || 0)} Nitrate samples</p>
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

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {[
            { id: 'chemicals', label: 'Chemicals' },
            { id: 'ecoli', label: 'E.coli by Beach' },
            { id: 'metals', label: 'Heavy Metals by Depth' },
            { id: 'yearly', label: 'Yearly Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`px-4 py-2 rounded-full border transition ${activeChart===tab.id ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Single Chart Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeChart === 'chemicals' && (
            <ChemicalChart chartData={chartData} hasAnimated={hasAnimated} />
          )}

          {activeChart === 'yearly' && (
            <YearlyTrendsChart chartData={chartData} hasAnimated={hasAnimated} />
          )}

          {activeChart === 'ecoli' && (
            <EcoliHeatmap chartData={chartData} />
          )}

          {activeChart === 'metals' && (
            <HeavyMetalsChart chartData={chartData} hasAnimated={hasAnimated} />
          )}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default StatisticsDashboard;