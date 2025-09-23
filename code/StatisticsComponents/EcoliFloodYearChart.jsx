import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { db } from '../services/firebase.js';
import { ref as dbRef, onValue, off } from 'firebase/database';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getYearlyEcoliFloodData(samples = []) {
  // Aggregate by year
  const yearly = {};
  samples.forEach(sample => {
    const year = sample.year || (sample.date ? new Date(sample.date).getFullYear() : null);
    if (!year) return;
    if (!yearly[year]) yearly[year] = { ecoli: [], flood: false };
    if (typeof sample.Ecoli === 'number') yearly[year].ecoli.push(sample.Ecoli);
    if (sample.flood_in_month === 1) yearly[year].flood = true;
  });
  // Prepare chart data
  const labels = Object.keys(yearly).sort();
  const ecoliAverages = labels.map(year => {
    const arr = yearly[year].ecoli;
    return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
  });
  const floodYears = labels.map(year => yearly[year].flood ? 1 : 0);
  return { labels, ecoliAverages, floodYears };
}

function flattenEcolifloods(ecofloodsData) {
  // ecofloodsData: { year: [monthObj, ...] }
  const samples = [];
  Object.keys(ecofloodsData || {}).forEach(year => {
    const monthsArr = ecofloodsData[year];
    if (!Array.isArray(monthsArr)) return;
    monthsArr.forEach((monthObj, monthIndex) => {
      if (!monthObj || typeof monthObj !== 'object') return;
      Object.keys(monthObj).forEach(dayKey => {
        const daySamples = monthObj[dayKey];
        if (!Array.isArray(daySamples)) return;
        daySamples.forEach(sample => {
          if (!sample || typeof sample !== 'object') return;
          samples.push({
            ...sample,
            year: Number(year),
            month: monthIndex + 1,
            day: Number(dayKey)
          });
        });
      });
    });
  });
  return samples;
}

const EcoliFloodYearChart = () => {
  const [samples, setSamples] = useState([]);
  useEffect(() => {
    const ecoRef = dbRef(db, 'Ecolifloods');
    const handler = (snap) => {
      const data = snap.val();
      const flat = flattenEcolifloods(data);
      setSamples(flat);
    };
    onValue(ecoRef, handler);
    return () => off(ecoRef, 'value', handler);
  }, []);

  const { labels, ecoliAverages, floodYears } = getYearlyEcoliFloodData(samples);
  const floodYearLabels = labels.filter((_, i) => floodYears[i]);
  // Find all months with flood_in_month === 1
  const floodMonths = samples
    .filter(s => s.flood_in_month === 1 && s.year && s.month)
    .map(s => `${s.year}-${String(s.month).padStart(2, '0')}`);
  const uniqueFloodMonths = Array.from(new Set(floodMonths));
  const data = {
    labels,
    datasets: [
      {
        label: 'Avg E.coli',
        data: ecoliAverages,
        backgroundColor: floodYears.map(f => f ? 'rgba(255,99,132,0.7)' : 'rgba(54,162,235,0.5)'),
        borderColor: floodYears.map(f => f ? 'rgba(255,99,132,1)' : 'rgba(54,162,235,1)'),
        borderWidth: 2,
      },
    ],
  };
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Yearly E.coli Levels (Flood Years Highlighted)',
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `E.coli: ${ctx.parsed.y?.toFixed(1)}${floodYears[ctx.dataIndex] ? ' (Flood)' : ''}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Year' } },
      y: { title: { display: true, text: 'Avg E.coli' }, beginAtZero: true },
    },
  };
  const chartRef = React.useRef(null);
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/jpeg', 1);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EcoliFloodYearChart.jpg`;
      link.click();
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div className="mb-2 text-center text-xs sm:text-sm md:text-base break-words">
        <span className="font-semibold text-red-600">Flood Months:</span>
        {uniqueFloodMonths.length > 0 ? (
          <span className="ml-2 text-red-500">{uniqueFloodMonths.join(', ')}</span>
        ) : (
          <span className="ml-2 text-gray-500">None</span>
        )}
      </div>
      <div className="mb-2 text-center text-xs sm:text-sm md:text-base break-words">
        <span className="font-semibold text-red-600">Flood Years:</span>
        {floodYearLabels.length > 0 ? (
          <span className="ml-2 text-red-500">{floodYearLabels.join(', ')}</span>
        ) : (
          <span className="ml-2 text-gray-500">None</span>
        )}
      </div>
      <div className="w-full h-[20rem] sm:h-[24rem] md:h-[28rem]">
        <Bar ref={chartRef} data={data} options={{
          ...options,
          plugins: {
            ...options.plugins,
            title: {
              ...options.plugins.title,
              font: { size: 16, weight: 'bold' },
              color: '#1e293b',
              padding: { top: 10, bottom: 10 },
            },
            legend: {
              ...options.plugins.legend,
              labels: {
                font: { size: 12, family: 'inherit', weight: 'bold' },
                padding: 12,
                boxWidth: 16,
                color: '#374151',
              },
            },
            tooltip: {
              ...options.plugins.tooltip,
              bodyFont: { size: 12 },
            },
          },
          scales: {
            x: {
              ...options.scales.x,
              title: {
                ...options.scales.x.title,
                font: { size: 13, weight: 'bold' },
              },
              ticks: {
                font: { size: 11 },
                maxRotation: 0,
                minRotation: 0,
                autoSkip: true,
              },
            },
            y: {
              ...options.scales.y,
              title: {
                ...options.scales.y.title,
                font: { size: 13, weight: 'bold' },
              },
              ticks: {
                font: { size: 11 },
              },
            },
          },
        }} />
      </div>
  <div className="flex justify-start mt-4">
        <button
          onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors font-medium flex items-center"
              >
                  Download
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                </svg>
              </button>
      </div>
    </div>
  );
};

export default EcoliFloodYearChart;
