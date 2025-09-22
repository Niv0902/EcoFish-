import React, { useState, useMemo, useEffect } from 'react';
import { Scatter, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

// Flatten nested measurements from Chemicals_Height and Heavy_Metals
function flattenMeasurements(obj, source = '') {
  const samples = [];
  if (!obj || typeof obj !== 'object') return samples;
  Object.entries(obj).forEach(([year, arr]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach(monthObj => {
      if (!monthObj || typeof monthObj !== 'object') return;
      Object.entries(monthObj).forEach(([month, arr2]) => {
        let flood = null;
        if (monthObj.flood !== undefined) flood = monthObj.flood;
        if (!Array.isArray(arr2)) return;
        arr2.forEach(sample => {
          if (sample && typeof sample === 'object') {
            samples.push({ ...sample, year, month, source, flood });
          }
        });
      });
    });
  });
  return samples;
}

function flattenFirebaseData(data) {
  if (!data) return [];
  const chem = flattenMeasurements(data.Chemicals_Height, 'Chemicals_Height');
  const metals = [];
  if (data.Heavy_Metals && typeof data.Heavy_Metals === 'object') {
    Object.entries(data.Heavy_Metals).forEach(([depth, yearObj]) => {
      metals.push(...flattenMeasurements(yearObj, `Heavy_Metals_${depth}`));
    });
  }
  // Flatten E.coli floods data
  const ecoliFloods = [];
  if (data.Ecolifloods && typeof data.Ecolifloods === 'object') {
    Object.entries(data.Ecolifloods).forEach(([year, arr]) => {
      if (!Array.isArray(arr)) return;
      arr.forEach(monthObj => {
        if (!monthObj || typeof monthObj !== 'object') return;
        Object.entries(monthObj).forEach(([month, arr2]) => {
          if (!Array.isArray(arr2)) return;
          arr2.forEach(sample => {
            if (sample && typeof sample === 'object') {
              ecoliFloods.push({ ...sample, year, month, source: 'Ecolifloods' });
            }
          });
        });
      });
    });
  }
  return [...chem, ...metals, ...ecoliFloods];
}

  function getAllNumericFields(samples, includeStrings = false) {
    const fields = new Set();
    samples.forEach(s => {
      Object.entries(s).forEach(([k, v]) => {
        if (typeof v === 'number' && !isNaN(v)) fields.add(k);
        // Optionally include string fields for dropdowns
        if (includeStrings && typeof v === 'string' && v.length < 30) fields.add(k);
      });
      // Always include flood_in_month if present
      if ('flood_in_month' in s) {
        fields.add('flood_in_month');
      }
    });
    return Array.from(fields);
  }

function pearsonCorrelation(x, y) {
  const n = x.length;
  if (n !== y.length || n === 0) return null;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denomX = 0, denomY = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - avgX) * (y[i] - avgY);
    denomX += (x[i] - avgX) ** 2;
    denomY += (y[i] - avgY) ** 2;
  }
  return num / Math.sqrt(denomX * denomY);
}

export default function ChlorophyllVsNitrateScatter() {
  const [chemSamples, setChemSamples] = useState([]);
  const [chemFields, setChemFields] = useState([]);
  const [chemX, setChemX] = useState('');
  const [chemY, setChemY] = useState('');
  const [metalSamples, setMetalSamples] = useState([]);
  const [metalFields, setMetalFields] = useState([]);
  const [metalX, setMetalX] = useState('');
  const [metalY, setMetalY] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('chemicals');
  const chemChartRef = React.useRef(null);
  const metalChartRef = React.useRef(null);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await get(ref(db, '/'));
      const val = snapshot.val();
      // Chemicals
      const chem = flattenMeasurements(val?.Chemicals_Height, 'Chemicals_Height');
      const chemFieldsArr = getAllNumericFields(chem);
      setChemSamples(chem);
      setChemFields(chemFieldsArr);
      setChemX(chemFieldsArr[0] || '');
      setChemY(chemFieldsArr[1] || chemFieldsArr[0] || '');
      // Metals
      let metals = [];
      if (val?.Heavy_Metals && typeof val.Heavy_Metals === 'object') {
        Object.entries(val.Heavy_Metals).forEach(([depth, yearObj]) => {
          metals.push(...flattenMeasurements(yearObj, `Heavy_Metals_${depth}`));
        });
      }
      const metalFieldsArr = getAllNumericFields(metals);
      setMetalSamples(metals);
      setMetalFields(metalFieldsArr);
      setMetalX(metalFieldsArr[0] || '');
      setMetalY(metalFieldsArr[1] || metalFieldsArr[0] || '');
      // ...existing code...
      setLoading(false);
    }
    fetchData();
  }, []);

  function getPoints(samples, xField, yField, chartTitle) {
    if (!xField || !yField) return [];
    // For E.coli Floods chart, always return all valid (Ecoli, flood_in_month) pairs if those fields are selected
    if (chartTitle === 'E.coli Floods Correlation' && xField === 'Ecoli' && yField === 'flood_in_month') {
      return samples
        .filter(s => typeof s.Ecoli === 'number' && typeof s.flood_in_month === 'number')
        .map(s => ({ x: s.Ecoli, y: s.flood_in_month }));
    }
    return samples
      .map(s => {
        if (typeof s[xField] === 'number' && typeof s[yField] === 'number') {
          return { x: s[xField], y: s[yField] };
        }
        return null;
      })
      .filter(Boolean);
  }

  function getCorrelation(points, xField, yField) {
    if (points.length < 2) return null;
    // If same field selected for X and Y, correlation is always 1
    if (xField === yField) return 1;
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    return pearsonCorrelation(x, y);
  }

  const chemPoints = useMemo(() => getPoints(chemSamples, chemX, chemY, 'Chemicals Correlation'), [chemSamples, chemX, chemY]);
  const metalPoints = useMemo(() => getPoints(metalSamples, metalX, metalY, 'Heavy Metals Correlation'), [metalSamples, metalX, metalY]);
  const chemCorr = useMemo(() => getCorrelation(chemPoints, chemX, chemY), [chemPoints, chemX, chemY]);
  const metalCorr = useMemo(() => getCorrelation(metalPoints, metalX, metalY), [metalPoints, metalX, metalY]);

  // Add renderChart function before return
  function renderChart(title, fields, xField, setXField, yField, setYField, points, corr, chartRef) {
    const chartData = {
      datasets: [
        {
          label: title,
          data: points,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 4,
        },
      ],
    };
    const handleDownload = () => {
      if (chartRef && chartRef.current) {
        const url = chartRef.current.toBase64Image('image/jpeg', 1.0);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/\s+/g, '_')}_Scatter.jpg`;
        link.click();
      } else {
        alert('Chart image download not supported in this browser.');
      }
    };
    return (
      <div className="p-4 bg-white rounded shadow mb-8 w-full">
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-4 text-center break-words">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center items-center">
          <div className="w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium mb-1">X Axis</label>
            <select className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto" value={xField} onChange={e => setXField(e.target.value)}>
              {fields.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-medium mb-1">Y Axis</label>
            <select className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto" value={yField} onChange={e => setYField(e.target.value)}>
              {fields.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 w-full h-[20rem] sm:h-[24rem] md:h-[28rem]">
          <Scatter
            ref={chartRef}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  bodyFont: { size: 12 },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: xField,
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
                    text: yField,
                    font: { size: 13, weight: 'bold' },
                  },
                  ticks: {
                    font: { size: 11 },
                  },
                },
              },
            }}
          />
          <div className="flex justify-start mt-4 pl-4">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors font-medium"
              onClick={handleDownload}
            >
              Download
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
              </svg>
            </button>
            <div className="mb-6"></div>
          </div>
        </div>
        <div className="text-xs sm:text-sm md:text-base mb-2 text-center break-words">
          {corr !== null ? (
            <span>Pearson correlation coefficient: <b>{corr.toFixed(3)}</b></span>
          ) : (
            <span>Not enough data to calculate correlation.</span>
          )}
          {corr !== null && (
            <div className="mt-1 text-gray-700">
              {corr > 0.7 && 'Strong positive correlation: as X increases, Y tends to increase.'}
              {corr < -0.7 && 'Strong negative correlation: as X increases, Y tends to decrease.'}
              {corr >= 0.3 && corr <= 0.7 && 'Moderate positive correlation.'}
              {corr <= -0.3 && corr >= -0.7 && 'Moderate negative correlation.'}
              {corr > -0.3 && corr < 0.3 && 'Weak or no correlation.'}
            </div>
          )}
        </div>
        <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 text-left break-words">
          <b>Correlation assumptions:</b> <br />
          - Both variables are continuous and approximately normally distributed.<br />
          - Relationship is linear.<br />
          - No significant outliers.<br />
          - Homoscedasticity (equal variance across values).<br />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      {loading ? (
        <div className="p-4 text-center text-sm sm:text-base">Loading data...</div>
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-2 items-center justify-center">
            <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-0">Select Correlation Chart</label>
            <select className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto" value={activeChart} onChange={e => setActiveChart(e.target.value)}>
              <option value="chemicals">Chemicals</option>
              <option value="metals">Heavy Metals</option>
            </select>
          </div>
          {activeChart === 'chemicals' && renderChart('Chemicals Correlation', chemFields, chemX, setChemX, chemY, setChemY, chemPoints, chemCorr, chemChartRef)}
          {activeChart === 'metals' && renderChart('Heavy Metals Correlation', metalFields, metalX, setMetalX, metalY, setMetalY, metalPoints, metalCorr, metalChartRef)}
        </>
      )}
    </div>
  );
}