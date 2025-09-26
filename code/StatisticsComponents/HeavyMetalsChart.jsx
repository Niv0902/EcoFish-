import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

const HeavyMetalsChart = ({ chartData, hasAnimated }) => {
  const [selectedMetal, setSelectedMetal] = useState('');

  useEffect(() => {
    if (!selectedMetal && chartData.metalList && chartData.metalList.length > 0) {
      setSelectedMetal(chartData.metalList[0]);
    }
  }, [chartData.metalList, selectedMetal]);

  const chartRef = useRef(null);
  return (
  <div className="pb-16">
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
          <>
            <Bar
              key="metals-depth-bar"
              ref={chartRef}
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
                animation: {
                  duration: 1200,
                  easing: 'easeOutQuart',
                  animateScale: true,
                  animateRotate: true
                },
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
                  x: {
  title: { 
    display: true, 
    text: 'Depth (m)', 
    font: { weight: 'bold' } // <-- move here
  },
  ticks: {
    padding: 12,
    autoSkip: false,
    maxRotation: 0,
    minRotation: 0,
    align: 'center'
  },
  offset: true,
  grid: { drawOnChartArea: true }
},
                  y: { title: { display: true, text: `${selectedMetal} avg concentration (µg/L)`,   font: { weight: 'bold' } }, type: 'logarithmic' }
                }
              }}
            />
            <button
              className="mt-2 mb-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-sm flex items-center"
              onClick={() => {
                const chartInstance = chartRef.current?.chartInstance || chartRef.current?.instance || chartRef.current;
                if (chartInstance && chartInstance.toBase64Image) {
                  const link = document.createElement('a');
                  link.href = chartInstance.toBase64Image('image/jpeg', 1.0);
                  link.download = `${selectedMetal}-by-depth.jpg`;
                  link.click();
                } else {
                  alert('Chart image download not supported in this browser.');
                }
              }}
            >
              Download
                                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
          </svg>
            </button>
            <div className="mt-4 px-4 text-gray-700 text-sm text-left break-words">
              <b>What is measured?</b> Heavy metals (µg/L) such as lead, mercury, and cadmium are measured at different depths. Even low concentrations can be toxic to aquatic life and humans.<br/>
              <b>Trends:</b> Higher concentrations at certain depths may indicate pollution sources or sediment release. Lower values suggest cleaner water at those depths.
            </div>
          </>
        ) : <p className="text-center text-gray-500">No heavy metal data available</p>}
      </div>
    </div>
  );
};

export default HeavyMetalsChart;