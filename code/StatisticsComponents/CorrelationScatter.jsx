import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, Tooltip, Legend } from 'chart.js';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import regression from 'regression';

ChartJS.register(PointElement, LinearScale, Tooltip, Legend);

function flattenMeasurements(obj) {
  const samples = [];
  if (!obj || typeof obj !== 'object') return samples;
  Object.entries(obj).forEach(([year, arr]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach(monthObj => {
      if (!monthObj || typeof monthObj !== 'object') return;
      Object.entries(monthObj).forEach(([month, arr2]) => {
        if (!Array.isArray(arr2)) return;
        arr2.forEach(sample => {
          if (sample && typeof sample === 'object') {
            samples.push({ ...sample, year, month });
          }
        });
      });
    });
  });
  return samples;
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

function mergeTablesForCorrelation(chemSamples, ecoliFloods, chemField, ecoliField) {
  const merged = [];
  chemSamples.forEach(chemSample => {
    if (!chemSample[chemField] || !chemSample.year || !chemSample.month) return;
    const matchingEcoli = ecoliFloods.find(ecoliSample => 
      ecoliSample.year === chemSample.year && 
      ecoliSample.month === chemSample.month &&
      ecoliSample[ecoliField] != null
    );
    if (matchingEcoli) {
      merged.push({
        x: chemSample[chemField],
        y: matchingEcoli[ecoliField],
        year: chemSample.year,
        month: chemSample.month
      });
    }
  });
  return merged;
}

export default function CorrelationScatter() {
  const [ecoliFloods, setEcoliFloods] = useState([]);
  const [chemSamples, setChemSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await get(ref(db, '/'));
      const val = snapshot.val();
      const chem = flattenMeasurements(val?.Chemicals_Height);
      setChemSamples(chem);
      const ecoli = flattenMeasurements(val?.Ecolifloods);
      setEcoliFloods(ecoli);
      setLoading(false);
    }
    fetchData();
  }, []);

  const mergedPoints = useMemo(() => 
    mergeTablesForCorrelation(chemSamples, ecoliFloods, 'chl_ug_l_avg', 'Ecoli'), 
    [chemSamples, ecoliFloods]
  );

  const regressionLine = useMemo(() => {
    if (mergedPoints.length < 2) return null;
    const data = mergedPoints.map(p => [p.x, p.y]);
    const result = regression.linear(data);
    return result.points;
  }, [mergedPoints]);

  const crossTableCorrelation = useMemo(() => {
    if (mergedPoints.length < 2) return null;
    const x = mergedPoints.map(p => p.x);
    const y = mergedPoints.map(p => p.y);
    return pearsonCorrelation(x, y);
  }, [mergedPoints]);

  const handleDownload = () => {
    if (chartRef.current && chartRef.current.canvas) {
      const canvas = chartRef.current.canvas;
      const url = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chlorophyll-ecoli-correlation.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Chart download not available');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {loading ? (
        <div className="p-4 text-center">Loading data...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Correlation: Chlorophyll-a vs E.coli
              </h3>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                disabled={mergedPoints.length === 0}
              >
                Download
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                </svg>
              </button>
            </div>
            <div className="w-full" style={{ height: '400px' }}>
              <Scatter
                ref={chartRef}
                data={{
                  datasets: [
                    {
                      label: 'Chlorophyll-a vs E.coli',
                      data: mergedPoints,
                      backgroundColor: 'rgba(54,162,235,0.6)',
                      borderColor: 'rgba(54,162,235,1)',
                      pointRadius: 5,
                      pointHoverRadius: 7,
                    },
                    ...(regressionLine ? [{
                      label: 'Regression Line',
                      data: regressionLine.map(([x, y]) => ({ x, y })),
                      type: 'line',
                      borderColor: 'rgba(255,99,132,0.8)',
                      borderWidth: 2,
                      pointRadius: 0,
                      fill: false,
                      showLine: true,
                    }] : [])
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      display: true,
                      position: 'top',
                    },
                    tooltip: { 
                      callbacks: {
                        label: function(context) {
                          if (context.datasetIndex === 0) {
                            const point = mergedPoints[context.dataIndex];
                            return `Chlorophyll-a: ${context.parsed.x.toFixed(2)}, E.coli: ${context.parsed.y.toFixed(2)} (${point?.year}/${point?.month})`;
                          }
                          return context.dataset.label;
                        }
                      }
                    },
                  },
                  scales: {
                    x: {
                      title: { 
                        display: true, 
                        text: 'Chlorophyll-a (chl_ug_l_avg)', 
                        font: { size: 14, weight: 'bold' } 
                      },
                      grid: { color: 'rgba(0,0,0,0.1)' },
                    },
                    y: {
                      title: { 
                        display: true, 
                        text: 'E.coli', 
                        font: { size: 14, weight: 'bold' } 
                      },
                      grid: { color: 'rgba(0,0,0,0.1)' },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-800">
                  {crossTableCorrelation !== null ? (
                    `Pearson correlation coefficient: ${crossTableCorrelation.toFixed(3)}`
                  ) : (
                    'Not enough data to calculate correlation.'
                  )}
                </div>
                {crossTableCorrelation !== null && (
                  <div className="mt-1 text-xs text-blue-700 text-center">
                    A low correlation coefficient between chlorophyll and E.coli can actually indicate a positive or normal situation regarding pollution.
                  </div>
                )}
                {crossTableCorrelation !== null && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className={`font-semibold ${
                      Math.abs(crossTableCorrelation) > 0.7 ? 'text-red-600' :
                      Math.abs(crossTableCorrelation) > 0.3 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(crossTableCorrelation) > 0.7 && 'Strong correlation'}
                      {Math.abs(crossTableCorrelation) <= 0.7 && Math.abs(crossTableCorrelation) > 0.3 && 'Moderate correlation'}
                      {Math.abs(crossTableCorrelation) <= 0.3 && 'Weak correlation'}
                    </span>
                    {crossTableCorrelation > 0 ? ' (positive)' : ' (negative)'}
                    <br />
                    <span className="text-xs">Based on {mergedPoints.length} matched data pairs</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}