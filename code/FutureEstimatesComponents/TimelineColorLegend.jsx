import React from 'react';
import { Info } from 'lucide-react';

const TimelineColorLegend = () => {
  const pollutionLevels = [
    { range: "0.0-0.5", label: "Very Clean", color: "#1e40af" },
    { range: "0.5-1.0", label: "Clean", color: "#3b82f6" },
    { range: "1.0-1.5", label: "Light Pollution", color: "#60a5fa" },
    { range: "1.5-2.0", label: "Moderate", color: "#93c5fd" },
    { range: "2.0-2.5", label: "Advanced", color: "#fde047" },
    { range: "2.5-3.0", label: "High", color: "#fb923c" },
    { range: "3.0-3.5", label: "Severe", color: "#f97316" },
    { range: "3.5-4.0", label: "Critical", color: "#dc2626" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Timeline Color Legend</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        The animation shows pollution levels across Lake Kinneret from 2010-2023. Each color represents a different pollution intensity level.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pollutionLevels.map((level) => (
          <div key={level.range} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-300"
              style={{ backgroundColor: level.color }}
            ></div>
            <div>
              <span className="text-xs font-medium text-gray-800">{level.range}</span>
              <span className="text-xs text-gray-600 block">{level.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineColorLegend;