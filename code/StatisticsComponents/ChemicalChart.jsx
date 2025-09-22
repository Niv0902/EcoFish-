import React, { useState, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';

const ChemicalChart = ({ chartData, hasAnimated }) => {
  const [selectedChemical, setSelectedChemical] = useState('chlorophyll');

  // Helper: get monthly averages across all years
  const getMonthlyAverages = (data) => {
    const grouped = Array(12).fill().map(() => []);
    data.forEach(({ date, value }) => {
      const month = date.getMonth();
      grouped[month].push(value);
    });
    return grouped.map(vals => vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null);
  };

  const chartRef = useRef(null);
  // Memoized chart data for monthly trends
  const chartConfig = useMemo(() => {
    let raw, label, color;
    if (selectedChemical === 'chlorophyll') {
      raw = chartData.chlorophyll;
      label = 'Chlorophyll-a';
      color = '#10b981';
    } else if (selectedChemical === 'nitrate') {
      raw = chartData.nitrate;
      label = 'Nitrate';
      color = '#3b82f6';
    } else if (selectedChemical === 'nitrite') {
      raw = chartData.nitrite || [];
      label = 'Nitrite';
      color = '#fbbf24';
    }
    const monthlyAverages = getMonthlyAverages(raw);
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      labels,
      datasets: [{
        label: `${label} Monthly Trend`,
        data: monthlyAverages,
        borderColor: color,
        backgroundColor: color + '22',
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 8,
        spanGaps: true,
        tension: 0.4,
        fill: true // Fill area under the line
      }]
    };
  }, [selectedChemical, chartData]);

    return (
  <div className="h-[30rem]">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-600">Select metric:</label>
          <select
            value={selectedChemical}
            onChange={(e) => setSelectedChemical(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="chlorophyll">Chlorophyll-a</option>
            <option value="nitrate">Nitrate</option>
            <option value="nitrite">Nitrite</option>
          </select>
        </div>
        {((selectedChemical === 'chlorophyll' && chartData.chlorophyll.length) ||
          (selectedChemical === 'nitrate' && chartData.nitrate.length) ||
          (selectedChemical === 'nitrite' && chartData.nitrite && chartData.nitrite.length)) ? (
          <>
            <Line
              key={`chemicals-${selectedChemical}`}
              ref={chartRef}
              data={chartConfig}
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
                    backgroundColor: 'rgba(243,244,246,0.95)',
                    titleColor: '#111827',
                    bodyColor: '#374151',
                    borderColor: '#9CA3AF',
                    borderWidth: 1,
                    padding: 16,
                    callbacks: {
                      afterBody: () => [
                        selectedChemical === 'chlorophyll'
                          ? 'Chlorophyll‑a is a marker for algal biomass and blooms. High values indicate nutrient enrichment (eutrophication) and reduced water clarity.'
                          : 'Nitrate (mg/L) indicates nutrient pollution, often from agriculture or sewage. Rising trends over time may accelerate algal blooms and reduce water quality.'
                      ]
                    }
                  },
                  zoom: {
                    pan: { enabled: true, mode: 'xy' },
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
                  }
                },
                hover: { mode: 'nearest', intersect: false },
                scales: {
                  y: { beginAtZero: true },
                  x: {
                    ticks: {
                      padding: 12,
                      autoSkip: false,
                      maxRotation: 0,
                      minRotation: 0
                    },
                    grid: {
                      drawOnChartArea: true,
                    },
                    offset: true,
                    title: {
                      display: false
                    }
                  }
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
                  link.download = `${selectedChemical}-monthly-trend.jpg`;
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
            <div className="mt-4 px-2 text-gray-700 text-sm text-left">
              {selectedChemical === 'chlorophyll' ? (
                <>
                  <b>What is measured?</b> Chlorophyll‑a is a marker for algal biomass and blooms. High values indicate nutrient enrichment (eutrophication) and reduced water clarity.<br/>
                  <b>Trends:</b> An increase over the months may indicate seasonal blooms or pollution, while a decrease suggests cleaner water.
                </>
              ) : selectedChemical === 'nitrate' ? (
                <>
                  <b>What is measured?</b> Nitrate (mg/L) is a pollutant often originating from agricultural fertilizers or sewage. High values indicate nutrient pollution in the water.<br/>
                  <b>Trends:</b> An increase over the months may indicate ongoing pollution, while a decrease suggests improving water quality.
                </>
              ) : (
                <>
                  <b>What is measured?</b> Nitrite (mg/L) is a pollutant often originating from sewage or industrial waste. High values can indicate contamination and pose health risks.<br/>
                  <b>Trends:</b> An increase over the months may indicate new pollution sources, while a decrease suggests improving water quality.
                </>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No {selectedChemical === 'chlorophyll' ? 'chlorophyll' : selectedChemical === 'nitrate' ? 'nitrate' : 'nitrite'} data available</p>
        )}
      </div>
  );
}

export default ChemicalChart;