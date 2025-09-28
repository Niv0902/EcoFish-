import React from 'react';
import { Droplets, Zap, FlaskConical } from 'lucide-react';

const pollutionSources = {
  chemical: {
    name: 'Chemical Parameters',
    icon: FlaskConical,
    parameters: ['Chloride', 'Lake Level', 'Depth'],
    description: 'Chemical indicators of water quality and environmental conditions',
    color: 'text-blue-600'
  },
  heavyMetals: {
    name: 'Heavy Metals',
    icon: Zap,
    parameters: ['Zn (Zinc)', 'Pb (Lead)'],
    description: 'Toxic metal contamination monitoring',
    color: 'text-yellow-600'
  },
  biological: {
    name: 'Biological Indicators',
    icon: Droplets,
    parameters: ['E.coli bacteria', 'Flood Risk'],
    description: 'Biological contamination and environmental risk factors',
    color: 'text-green-600'
  }
};

const PollutionSources = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Data Sources & Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(pollutionSources).map(([key, source]) => {
          const IconComponent = source.icon;
          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <IconComponent className={`w-5 h-5 ${source.color}`} />
                <h4 className="text-lg font-semibold text-gray-800">{source.name}</h4>
              </div>
              <p className="text-gray-600 mb-3 text-sm">{source.description}</p>
              <div className="space-y-2">
                {source.parameters.map((param, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-700">{param}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollutionSources;