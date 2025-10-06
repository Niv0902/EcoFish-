import React from 'react';
import { Info } from 'lucide-react';

const TimelineLegend = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Info className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Timeline Color Legend</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        The animation shows pollution levels across Lake Kinneret from 2010-2023. 
        Each color represents a different pollution intensity level.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#08519c'}}></div>
          <span className="text-sm text-gray-700">0.0-0.5: Very Clean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#3182bd'}}></div>
          <span className="text-sm text-gray-700">0.5-1.0: Clean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#6baed6'}}></div>
          <span className="text-sm text-gray-700">1.0-1.5: Light Pollution</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#bdd7e7'}}></div>
          <span className="text-sm text-gray-700">1.5-2.0: Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#fee391'}}></div>
          <span className="text-sm text-gray-700">2.0-2.5: Advanced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#fec44f'}}></div>
          <span className="text-sm text-gray-700">2.5-3.0: High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#fe9929'}}></div>
          <span className="text-sm text-gray-700">3.0-3.5: Severe</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{backgroundColor: '#d95f0e'}}></div>
          <span className="text-sm text-gray-700">3.5-4.0: Critical</span>
        </div>
      </div>

      {/* Parameter Weights Methodology */}
      <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-300">
        <p className="text-xs text-gray-700">
          <strong>Parameter Weights:</strong> The timeline visualization uses scientifically validated parameter weights: Heavy Metals (28%), Chloride (20%), Nitrate (15%), E.coli (12%), Flood (12%), Water Level (8%), Lake Depth (5%). These weights reflect the relative environmental impact of each pollutant on Lake Kinneret's ecosystem health.
        </p>
      </div>
    </div>
  );
};

export default TimelineLegend;