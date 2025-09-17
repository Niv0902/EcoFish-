import React, { useEffect, useMemo, useState, useRef } from 'react';
import { db } from '../firebase.js';
import { ref as dbRef, onValue, off } from 'firebase/database';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Graphs = () => {
  const [chemicalData, setChemicalData] = useState({});
  const [ecofloodsData, setEcofloodsData] = useState({});
  const [heavyMetalsData, setHeavyMetalsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Refs for chart cleanup
  const chartRefs = useRef({});

  // Cleanup function for charts
  useEffect(() => {
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) {
          try {
            chart.destroy();
          } catch (e) {
            console.log('Chart cleanup:', e);
          }
        }
      });
    };
  }, []);

  // Load data from Firebase
  useEffect(() => {
    let loadedCount = 0;
    const totalDatasets = 3;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalDatasets) {
        setLoading(false);
      }
    };

    // Load Chemical data with proper structure parsing
    const chemicalRef = dbRef(db, 'Chemicals_Height');
    const chemicalUnsubscribe = onValue(chemicalRef, (snap) => {
      const data = snap.val();
      console.log('=== CHEMICAL DATA LOADING ===');
      console.log('Raw data:', data);
      
      if (data && typeof data === 'object') {
        setChemicalData(data);
      } else {
        setChemicalData({});
      }
      
      checkAllLoaded();
    }, (error) => {
      console.error('Error loading chemical data:', error);
      checkAllLoaded();
    });

    // Load Ecolifloods data
    const ecoRef = dbRef(db, 'Ecolifloods');
    const ecoUnsubscribe = onValue(ecoRef, (snap) => {
      const data = snap.val();
      console.log('=== ECOLIFLOODS DATA LOADING ===');
      console.log('Raw data:', data);
      
      if (data && typeof data === 'object') {
        setEcofloodsData(data);
      } else {
        setEcofloodsData({});
      }
      
      checkAllLoaded();
    }, (error) => {
      console.error('Error loading ecolifloods data:', error);
      checkAllLoaded();
    });

    // Load Heavy Metals data
    const metalRef = dbRef(db, 'Heavy_Metals');
    const metalUnsubscribe = onValue(metalRef, (snap) => {
      const data = snap.val();
      console.log('=== HEAVY METALS DATA LOADING ===');
      console.log('Raw data:', data);
      
      if (data && typeof data === 'object') {
        setHeavyMetalsData(data);
      } else {
        setHeavyMetalsData({});
      }
      
      checkAllLoaded();
    }, (error) => {
      console.error('Error loading heavy metals data:', error);
      checkAllLoaded();
    });

    return () => {
      off(chemicalRef, 'value', chemicalUnsubscribe);
      off(ecoRef, 'value', ecoUnsubscribe);
      off(metalRef, 'value', metalUnsubscribe);
    };
  }, []);

  // Update chart data when data changes
  const chartData = useMemo(() => {
    // Defensive helpers
    const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
    const chlorophyll = [];
    const nitrate = [];
    const beachesMap = new Map();
    const metalsMap = new Map();

    // ---- Chemicals_Height traversal ----
    Object.keys(chemicalData || {}).forEach(year => {
      const monthsArr = chemicalData[year];
      if (!Array.isArray(monthsArr)) return;
      monthsArr.forEach((monthObj, monthIndex) => {
        if (!isObject(monthObj)) return; // skip nulls
        Object.keys(monthObj).forEach(dayKey => {
          const samplesArr = monthObj[dayKey];
            if (!Array.isArray(samplesArr)) return;
            samplesArr.forEach(sample => {
              if (!isObject(sample)) return;
              const dateStr = sample.date || `${year}-${String(monthIndex+1).padStart(2,'0')}-${String(dayKey).padStart(2,'0')}`;
              const date = new Date(dateStr);
              if (sample.chl_ug_l_avg != null && !isNaN(sample.chl_ug_l_avg)) {
                chlorophyll.push({ date, value: Number(sample.chl_ug_l_avg) });
              }
              if (sample.avg_nitrate != null && !isNaN(sample.avg_nitrate)) {
                nitrate.push({ date, value: Number(sample.avg_nitrate) });
              }
            });
        });
      });
    });

    chlorophyll.sort((a,b)=>a.date-b.date);
    nitrate.sort((a,b)=>a.date-b.date);

    // ---- Ecolifloods traversal ----
    Object.keys(ecofloodsData || {}).forEach(year => {
      const monthsArr = ecofloodsData[year];
      if (!Array.isArray(monthsArr)) return;
      monthsArr.forEach((monthObj, monthIndex) => {
        if (!isObject(monthObj)) return;
        Object.keys(monthObj).forEach(dayKey => {
          const samplesArr = monthObj[dayKey];
          if (!Array.isArray(samplesArr)) return;
          samplesArr.forEach(sample => {
            if (!isObject(sample)) return;
            const beach = sample.beach_name || sample.beach || 'Unknown';
            if (sample.Ecoli != null && !isNaN(sample.Ecoli)) {
              const entry = beachesMap.get(beach) || { values: [], count: 0 };
              entry.values.push(Number(sample.Ecoli));
              entry.count += 1;
              beachesMap.set(beach, entry);
            }
          });
        });
      });
    });

    const beaches = Array.from(beachesMap.entries()).map(([beach, info]) => {
      const avg = info.values.reduce((s,v)=>s+v,0)/info.values.length;
      return { beach, average: avg, min: Math.min(...info.values), max: Math.max(...info.values), count: info.count };
    }).sort((a,b)=>b.average - a.average);

    // ---- Heavy_Metals traversal ----
    const metalFields = ['Al_µg_L','Cd_µg_L','Cu_µg_L','Fe_µg_L','Hg_µg_L','Mn_µg_L','Pb_µg_L','Zn_µg_L'];
    Object.keys(heavyMetalsData || {}).forEach(depth => {
      const yearsObj = heavyMetalsData[depth];
      if (!isObject(yearsObj)) return;
      Object.keys(yearsObj).forEach(year => {
        const monthsArr = yearsObj[year];
        if (!Array.isArray(monthsArr)) return;
        monthsArr.forEach((monthObj, monthIndex) => {
          if (!isObject(monthObj)) return;
          Object.keys(monthObj).forEach(dayKey => {
            const samplesArr = monthObj[dayKey];
            if (!Array.isArray(samplesArr)) return;
            samplesArr.forEach(sample => {
              if (!isObject(sample)) return;
              metalFields.forEach(field => {
                if (sample[field] != null && !isNaN(sample[field])) {
                  const metalName = field.replace('_µg_L','');
                  const entry = metalsMap.get(metalName) || { values: [], count: 0 };
                  entry.values.push(Number(sample[field]));
                  entry.count += 1;
                  metalsMap.set(metalName, entry);
                }
              });
            });
          });
        });
      });
    });

    const metals = Array.from(metalsMap.entries()).map(([metal, info]) => {
      const avg = info.values.reduce((s,v)=>s+v,0)/info.values.length;
      return { metal, average: avg, min: Math.min(...info.values), max: Math.max(...info.values), count: info.count };
    }).sort((a,b)=>b.average - a.average);

    console.log('[chartData] counts', { chlorophyll: chlorophyll.length, nitrate: nitrate.length, beaches: beaches.length, metals: metals.length });

    return { chlorophyll, nitrate, beaches, metals };
  }, [chemicalData, ecofloodsData, heavyMetalsData]);

  useEffect(() => {
    if (!hasAnimated && (chartData.chlorophyll.length || chartData.nitrate.length || chartData.beaches.length || chartData.metals.length)) {
      // mark after first population so next renders skip animation
      const t = setTimeout(()=>setHasAnimated(true), 1200); // allow initial chart animation to finish
      return () => clearTimeout(t);
    }
  }, [chartData, hasAnimated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Environmental Data</h2>
          <p className="text-gray-600">Connecting to Firebase database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-800 mb-3">🌊 EcoFish Analytics</h1>
          <p className="text-xl text-gray-600">Environmental Data Visualization Dashboard</p>
          <div className="w-48 md:w-150 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Analysis</h3>
                <p className="text-4xl font-bold text-green-600">{chemicalData.length}</p>
                <p className="text-gray-500 mt-1">Water quality samples</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Bacterial Analysis</h3>
                <p className="text-4xl font-bold text-blue-600">{ecofloodsData.length}</p>
                <p className="text-gray-500 mt-1">E.coli measurements</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🦠</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Heavy Metals</h3>
                <p className="text-4xl font-bold text-red-600">{heavyMetalsData.length}</p>
                <p className="text-gray-500 mt-1">Metal contamination tests</p>
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚗️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Chlorophyll Time Series */}
          <div key="chlorophyll-chart" className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🌿 Chlorophyll Trends</h2>
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                {chartData.chlorophyll.length} measurements
              </span>
            </div>
            <div className="h-96">
              {chartData.chlorophyll && chartData.chlorophyll.length > 0 ? (
                <Line
                  key="chlorophyll-chart"
                  data={{
                    labels: chartData.chlorophyll.map(item => 
                      item.date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
                    ),
                    datasets: [{
                      label: 'Chlorophyll-a (µg/L)',
                      data: chartData.chlorophyll.map(item => item.value),
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 5,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgb(34, 197, 94)',
                      pointBorderColor: 'white',
                      pointBorderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 1000 },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 14 }
                        }
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgb(34, 197, 94)',
                        borderWidth: 2,
                        cornerRadius: 8,
                        padding: 12
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Concentration (µg/L)',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Sampling Date',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl">No chlorophyll data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nitrate Levels */}
          <div key="nitrate-chart" className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">💧 Nitrate Pollution</h2>
              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                {chartData.nitrate.length} measurements
              </span>
            </div>
            <div className="h-96">
              {chartData.nitrate && chartData.nitrate.length > 0 ? (
                <Line
                  key="nitrate-chart"
                  data={{
                    labels: chartData.nitrate.map(item => 
                      item.date.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
                    ),
                    datasets: [{
                      label: 'Nitrate (mg/L)',
                      data: chartData.nitrate.map(item => item.value),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 5,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointBorderColor: 'white',
                      pointBorderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 1000 },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 14 }
                        }
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        cornerRadius: 8,
                        padding: 12
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Concentration (mg/L)',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Sampling Date',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl">No nitrate data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* E.coli by Beach */}
          <div key="ecoli-chart" className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🏖️ E.coli by Beach</h2>
              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                {chartData.beaches.length} locations
              </span>
            </div>
            <div className="h-96">
              {chartData.beaches && chartData.beaches.length > 0 ? (
                <Bar
                  key="ecoli-chart"
                  data={{
                    labels: chartData.beaches.map(item => 
                      item.beach.length > 12 ? item.beach.substring(0, 12) + '...' : item.beach
                    ),
                    datasets: [{
                      label: 'Average E.coli Level',
                      data: chartData.beaches.map(item => item.average),
                      backgroundColor: chartData.beaches.map((_, index) => {
                        const colors = [
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(249, 115, 22, 0.8)',
                          'rgba(245, 158, 11, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(147, 51, 234, 0.8)',
                          'rgba(236, 72, 153, 0.8)',
                          'rgba(20, 184, 166, 0.8)',
                          'rgba(156, 163, 175, 0.8)',
                          'rgba(99, 102, 241, 0.8)'
                        ];
                        return colors[index % colors.length];
                      }),
                      borderColor: chartData.beaches.map((_, index) => {
                        const colors = [
                          'rgb(239, 68, 68)',
                          'rgb(249, 115, 22)',
                          'rgb(245, 158, 11)',
                          'rgb(34, 197, 94)',
                          'rgb(59, 130, 246)',
                          'rgb(147, 51, 234)',
                          'rgb(236, 72, 153)',
                          'rgb(20, 184, 166)',
                          'rgb(156, 163, 175)',
                          'rgb(99, 102, 241)'
                        ];
                        return colors[index % colors.length];
                      }),
                      borderWidth: 2,
                      borderRadius: 8
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 1000 },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                          title: function(context) {
                            return chartData.beaches[context[0].dataIndex].beach;
                          },
                          afterBody: function(context) {
                            const data = chartData.beaches[context[0].dataIndex];
                            return [
                              `Samples: ${data.count}`,
                              `Range: ${data.min.toFixed(1)} - ${data.max.toFixed(1)}`
                            ];
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'E.coli Level',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Beach Location',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">🏖️</div>
                    <p className="text-xl">No beach E.coli data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Heavy Metals */}
          <div key="metals-chart" className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">⚗️ Heavy Metal Contamination</h2>
              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                {chartData.metals.length} detected
              </span>
            </div>
            <div className="h-96">
              {chartData.metals && chartData.metals.length > 0 ? (
                <Bar
                  key="metals-chart"
                  data={{
                    labels: chartData.metals.map(item => item.metal),
                    datasets: [{
                      label: 'Average Concentration (µg/L)',
                      data: chartData.metals.map(item => item.average),
                      backgroundColor: [
                        'rgba(220, 38, 127, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(163, 163, 163, 0.8)',
                        'rgba(120, 113, 108, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                      ],
                      borderColor: [
                        'rgb(220, 38, 127)',
                        'rgb(239, 68, 68)',
                        'rgb(249, 115, 22)',
                        'rgb(245, 158, 11)',
                        'rgb(163, 163, 163)',
                        'rgb(120, 113, 108)',
                        'rgb(168, 85, 247)',
                        'rgb(59, 130, 246)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 1000 },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                          afterBody: function(context) {
                            const data = chartData.metals[context[0].dataIndex];
                            return [
                              `Samples: ${data.count}`,
                              `Range: ${data.min.toFixed(3)} - ${data.max.toFixed(3)} µg/L`
                            ];
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        type: 'logarithmic',
                        title: {
                          display: true,
                          text: 'Concentration (µg/L) - Log Scale',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Metal Type',
                          font: { weight: 'bold', size: 14 }
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">⚗️</div>
                    <p className="text-xl">No heavy metals data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {(chartData.chlorophyll?.length > 0 || chartData.nitrate?.length > 0 || chartData.beaches?.length > 0 || chartData.metals?.length > 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">📊 Data Analysis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                <div className="text-4xl mb-3">🌿</div>
                <h3 className="font-bold text-green-700 mb-2">Chlorophyll Data</h3>
                <p className="text-3xl font-bold text-green-800">{chartData.chlorophyll?.length || 0}</p>
                <p className="text-sm text-green-600 mt-1">Water quality measurements</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <div className="text-4xl mb-3">💧</div>
                <h3 className="font-bold text-blue-700 mb-2">Nitrate Data</h3>
                <p className="text-3xl font-bold text-blue-800">{chartData.nitrate?.length || 0}</p>
                <p className="text-sm text-blue-600 mt-1">Pollution measurements</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                <div className="text-4xl mb-3">🏖️</div>
                <h3 className="font-bold text-orange-700 mb-2">Beach Locations</h3>
                <p className="text-3xl font-bold text-orange-800">{chartData.beaches?.length || 0}</p>
                <p className="text-sm text-orange-600 mt-1">E.coli monitoring sites</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                <div className="text-4xl mb-3">⚗️</div>
                <h3 className="font-bold text-red-700 mb-2">Metal Types</h3>
                <p className="text-3xl font-bold text-red-800">{chartData.metals?.length || 0}</p>
                <p className="text-sm text-red-600 mt-1">Heavy metal contaminants</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-10 text-gray-500">
          <p>EcoFish Environmental Monitoring System • Real-time Data Analysis</p>
        </div>
      </div>
    </div>
  );
};

export default Graphs;