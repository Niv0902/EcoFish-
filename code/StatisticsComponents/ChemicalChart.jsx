import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

const ChemicalChart = ({ chartData, hasAnimated }) => {
  const [selectedChemical, setSelectedChemical] = useState('chlorophyll');

  return (
    <div className="h-[28rem]">
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm text-gray-600">Select metric:</label>
        <select
          value={selectedChemical}
          onChange={(e) => setSelectedChemical(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="chlorophyll">Chlorophyll-a</option>
          <option value="nitrate">Nitrate</option>
        </select>
      </div>
      {(
        (selectedChemical === 'chlorophyll' && chartData.chlorophyll.length) ||
        (selectedChemical === 'nitrate' && chartData.nitrate.length)
      ) ? (
        <Line
          key={`chemicals-${selectedChemical}`}
          data={{
            labels: (selectedChemical === 'chlorophyll' ? chartData.chlorophyll : chartData.nitrate).map(d => d.date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })),
            datasets: [{
              label: selectedChemical === 'chlorophyll' ? 'Chlorophyll-a (µg/L)' : 'Nitrate (mg/L)',
              data: (selectedChemical === 'chlorophyll' ? chartData.chlorophyll : chartData.nitrate).map(d => d.value),
              borderColor: selectedChemical === 'chlorophyll' ? 'rgba(34,197,94,0.9)' : 'rgba(59,130,246,0.9)',
              backgroundColor: selectedChemical === 'chlorophyll' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
              showLine: false,
              pointRadius: 3,
              pointHoverRadius: 6
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: hasAnimated ? false : { duration: 800 },
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                backgroundColor: 'rgba(243,244,246,0.95)',
                titleColor: '#111827',
                bodyColor: '#374151',
                borderColor: '#9CA3AF',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                  afterBody: () => [
                    selectedChemical === 'chlorophyll'
                      ? 'Chlorophyll‑a is a marker for algal biomass and blooms. High values indicate nutrient enrichment (eutrophication) and reduced water clarity.'
                      : 'Nitrate (mg/L) indicates nutrient pollution, often from agriculture or sewage. Rising trends over time may accelerate algal blooms and reduce water quality.'
                  ]
                }
              }
            },
            scales: { y: { beginAtZero: true } }
          }}
        />
      ) : (
        <p className="text-center text-gray-500">No {selectedChemical === 'chlorophyll' ? 'chlorophyll' : 'nitrate'} data available</p>
      )}
    </div>
  );
};

export default ChemicalChart;