
import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { db } from '../services/firebase';
import { ref, get } from 'firebase/database';

function extractSamples(chemicals) {
  const samples = [];
  if (!chemicals) return samples;
  Object.keys(chemicals).forEach(year => {
    const monthsArr = chemicals[year];
    if (!Array.isArray(monthsArr)) return;
    monthsArr.forEach((monthObj, monthIndex) => {
      if (!monthObj) return;
      Object.keys(monthObj).forEach(dayKey => {
        const daySamples = monthObj[dayKey];
        if (!Array.isArray(daySamples)) return;
        daySamples.forEach(sample => {
          if (!sample) return;
          samples.push({
            year,
            month: monthIndex + 1,
            date: sample.date,
            chl_ug_l_avg: sample.chl_ug_l_avg,
            avg_nitrate: sample.avg_nitrate,
            avg_nitrit: sample.avg_nitrit
          });
        });
      });
    });
  });
  return samples;
}

const ChemicalExtremesBar = () => {
  const chartRef = React.useRef(null);
  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ChemicalExtremesBar.jpg`;
      link.click();
    } else {
      alert('Chart image download not supported in this browser.');
    }
  };
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChemical, setActiveChemical] = useState('chl'); // 'chl', 'nitrate', 'nitrit'

  useEffect(() => {
    async function fetchData() {
      const snapshot = await get(ref(db, '/Chemicals_Height'));
      const chemicals = snapshot.val();
      setSamples(extractSamples(chemicals));
      setLoading(false);
    }
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    // Find max/min for each chemical by year
    const yearly = {};
    samples.forEach(s => {
      if (!yearly[s.year]) yearly[s.year] = { chl: [], nitrate: [], nitrit: [] };
      if (s.chl_ug_l_avg != null) yearly[s.year].chl.push(s.chl_ug_l_avg);
      if (s.avg_nitrate != null) yearly[s.year].nitrate.push(s.avg_nitrate);
      if (s.avg_nitrit != null) yearly[s.year].nitrit.push(s.avg_nitrit);
    });
    const years = Object.keys(yearly).sort();
    let datasets = [];
    if (activeChemical === 'chl') {
      datasets = [
        {
          label: 'Max Chloride',
          data: years.map(y => yearly[y].chl.length ? Math.max(...yearly[y].chl) : null),
          backgroundColor: 'rgba(34,197,94,0.7)'
        },
        {
          label: 'Min Chloride',
          data: years.map(y => yearly[y].chl.length ? Math.min(...yearly[y].chl) : null),
          backgroundColor: 'rgba(34,197,94,0.5)'
        }
      ];
    } else if (activeChemical === 'nitrate') {
      datasets = [
        {
          label: 'Max Nitrate',
          data: years.map(y => yearly[y].nitrate.length ? Math.max(...yearly[y].nitrate) : null),
          backgroundColor: 'rgba(59,130,246,0.7)'
        },
        {
          label: 'Min Nitrate',
          data: years.map(y => yearly[y].nitrate.length ? Math.min(...yearly[y].nitrate) : null),
          backgroundColor: 'rgba(59,130,246,0.5)'
        }
      ];
    } else if (activeChemical === 'nitrit') {
      datasets = [
        {
          label: 'Max Nitrite',
          data: years.map(y => yearly[y].nitrit.length ? Math.max(...yearly[y].nitrit) : null),
          backgroundColor: 'rgba(251,191,36,0.7)'
        },
        {
          label: 'Min Nitrite',
          data: years.map(y => yearly[y].nitrit.length ? Math.min(...yearly[y].nitrit) : null),
          backgroundColor: 'rgba(251,191,36,0.5)'
        }
      ];
    }
    return {
      labels: years,
      datasets
    };
  }, [samples, activeChemical]);

  return (
    <div className="h-[32rem] w-full px-2 sm:px-4 md:px-6">
      <h3 className="mb-2 font-semibold text-base sm:text-lg md:text-xl text-gray-800 text-center break-words">Chemical Extremes by Year</h3>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-0">Select Chemical</label>
        <select
          className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto"
          value={activeChemical}
          onChange={e => setActiveChemical(e.target.value)}
        >
          <option value="chl">Chloride</option>
          <option value="nitrate">Nitrate</option>
          <option value="nitrit">Nitrite</option>
        </select>
      </div>
      {loading ? (
        <div className="p-4 text-center text-sm sm:text-base">Loading data...</div>
      ) : (
        <>
          <div className="w-full h-[24rem] sm:h-[28rem] md:h-[32rem]">
            <Bar
              ref={chartRef}
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      font: {
                        size: 12,
                        family: 'inherit',
                        weight: 'bold',
                      },
                      padding: 12,
                      boxWidth: 16,
                      color: '#374151',
                    },
                  },
                  tooltip: {
                    bodyFont: { size: 12 },
                    callbacks: {
                      label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                    }
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Year',
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
                    title: {
                      display: true,
                      text: 'Avg Concentration (µg/L)',
                      font: { size: 13, weight: 'bold' },
                    },
                    ticks: {
                      font: { size: 11 },
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex justify-start mt-4">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors font-medium"
              onClick={handleDownload}
            >
              Download
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
              </svg>
            </button>
          </div>
        </>
      )}
      <div className="mt-2 text-xs sm:text-sm md:text-base text-gray-600 text-left break-words w-full">
        <span className="whitespace-pre-line">Shows the highest and lowest measured values for each chemical per year. Helps identify extreme pollution events and clean periods.</span>
      </div>
    </div>
  );
};

export default ChemicalExtremesBar;
