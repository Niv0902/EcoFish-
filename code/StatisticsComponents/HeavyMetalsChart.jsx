import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const HeavyMetalsChart = ({ chartData, hasAnimated }) => {
  const [selectedMetal, setSelectedMetal] = useState('');

  useEffect(() => {
    if (!selectedMetal && chartData.metalList && chartData.metalList.length > 0) {
      setSelectedMetal(chartData.metalList[0]);
    }
  }, [chartData.metalList, selectedMetal]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-2"></div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Metal:</label>
        <select
          value={selectedMetal}
          onChange={e => setSelectedMetal(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          {(chartData.metalList || []).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="h-[28rem]">
        {selectedMetal && chartData.perDepthMetal && chartData.perDepthMetal[selectedMetal] ? (
          <Bar
            key="metals-depth-bar"
            data={{
              labels: Object.keys(chartData.perDepthMetal[selectedMetal]).sort((a,b)=>Number(a)-Number(b)),
              datasets: [{
                label: `${selectedMetal} by depth (avg, µg/L)`,
                data: Object.keys(chartData.perDepthMetal[selectedMetal]).sort((a,b)=>Number(a)-Number(b)).map(depthKey => {
                  const vals = chartData.perDepthMetal[selectedMetal][depthKey];
                  return vals.reduce((s,v)=>s+v,0)/vals.length;
                }),
                backgroundColor: 'rgba(220,38,127,0.75)',
                borderColor: 'rgb(220,38,127)',
                borderWidth: 1.5,
                borderRadius: 6
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
                  mode: 'index',
                  intersect: false,
                  displayColors: false,
                  backgroundColor: 'rgba(243,244,246,0.95)',
                  titleColor: '#111827',
                  bodyColor: '#374151',
                  borderColor: '#9CA3AF',
                  borderWidth: 1,
                  padding: 12,
                  callbacks: {
                    title: () => [],
                    label: () => '',
                    footer: () => [],
                    afterBody: () => [
                      'Heavy metal concentrations (µg/L), which can be toxic even at low levels, are shown here as averages by depth.'
                    ]
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: 'Depth (m)' } },
                y: { title: { display: true, text: 'Avg concentration (µg/L)' }, type: 'logarithmic' }
              }
            }}
          />
        ) : <p className="text-center text-gray-500">No heavy metal data available</p>}
      </div>
    </div>
  );
};

export default HeavyMetalsChart;