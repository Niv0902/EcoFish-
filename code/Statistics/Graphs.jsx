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
  const [activeChart, setActiveChart] = useState('chemicals'); // 'chemicals' | 'ecoli' | 'metals'
  const [selectedMetal, setSelectedMetal] = useState('');
  const [selectedChemical, setSelectedChemical] = useState('chlorophyll'); // 'chlorophyll' | 'nitrate'
  
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
    const metalFields = ['Al_µg_L','Cd_µg_L','Cu_µg_L','Fe_µg_L','Hg_µg_L','Mn_µg_L','Pb_µg_L','Zn_µg_L'];

    // Also collect per-depth per-metal lists
    const perDepthMetal = {}; // { metalName: { depth: number -> values:number[] } }

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
    Object.keys(heavyMetalsData || {}).forEach(depthKey => {
      const depth = Number(depthKey);
      const yearsObj = heavyMetalsData[depthKey];
      if (!isObject(yearsObj)) return;
      Object.keys(yearsObj).forEach(year => {
        const monthsArr = yearsObj[year];
        if (!Array.isArray(monthsArr)) return;
        monthsArr.forEach((monthObj) => {
          if (!isObject(monthObj)) return;
          Object.keys(monthObj).forEach(dayKey => {
            const samplesArr = monthObj[dayKey];
            if (!Array.isArray(samplesArr)) return;
            samplesArr.forEach(sample => {
              if (!isObject(sample)) return;
              metalFields.forEach(field => {
                if (sample[field] != null && !isNaN(sample[field])) {
                  const metalName = field.replace('_µg_L','');
                  const numVal = Number(sample[field]);
                  const entry = metalsMap.get(metalName) || { values: [], count: 0 };
                  entry.values.push(numVal);
                  entry.count += 1;
                  metalsMap.set(metalName, entry);

                  // per depth collection
                  if (!perDepthMetal[metalName]) perDepthMetal[metalName] = {};
                  if (!perDepthMetal[metalName][depth]) perDepthMetal[metalName][depth] = [];
                  perDepthMetal[metalName][depth].push(numVal);
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

    const metalList = metals.map(m=>m.metal);

    console.log('[chartData] counts', { chlorophyll: chlorophyll.length, nitrate: nitrate.length, beaches: beaches.length, metals: metals.length });

    return { chlorophyll, nitrate, beaches, metals, metalList, perDepthMetal };
  }, [chemicalData, ecofloodsData, heavyMetalsData]);

  useEffect(() => {
    if (!hasAnimated && (chartData.chlorophyll.length || chartData.nitrate.length || chartData.beaches.length || chartData.metals.length)) {
      // mark after first population so next renders skip animation
      const t = setTimeout(()=>setHasAnimated(true), 1200); // allow initial chart animation to finish
      return () => clearTimeout(t);
    }
  }, [chartData, hasAnimated]);

  useEffect(() => {
    if (!selectedMetal && chartData.metalList && chartData.metalList.length > 0) {
      setSelectedMetal(chartData.metalList[0]);
    }
  }, [chartData.metalList, selectedMetal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Environmental Data</h2>
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
          <div className="w-48 md:w-64 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500 mx-auto mt-4 rounded-full shadow-sm"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Analysis</h3>
                <p className="text-4xl font-bold text-green-600">{(chartData.chlorophyll?.length || 0) + (chartData.nitrate?.length || 0)}</p>
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
                <p className="text-4xl font-bold text-blue-600">{chartData.beaches?.length || 0}</p>
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
                <p className="text-4xl font-bold text-red-600">{chartData.metals?.length || 0}</p>
                <p className="text-gray-500 mt-1">Metal contamination tests</p>
              </div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚗️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {[
            { id: 'chemicals', label: 'Chemicals (Scatter)' },
            { id: 'ecoli', label: 'E.coli by Beach' },
            { id: 'metals', label: 'Heavy Metals by Depth' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`px-4 py-2 rounded-full border transition ${activeChart===tab.id ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Single Chart Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeChart === 'chemicals' && (
            <div className="h-[28rem]">
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm text-gray-600">בחר מדד:</label>
                <select
                  value={selectedChemical}
                  onChange={(e)=>setSelectedChemical(e.target.value)}
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
                            '—',
                            selectedChemical === 'chlorophyll'
                              ? 'כלורופיל‑a משמש כסמן לביומסת אצות ולפריחת אצות. ערכים גבוהים מרמזים על העשרה תזונתית (eutrophication) וירידה בשקיפות המים.'
                              : 'ניטראט (mg/L) מעיד על זיהום תזונתי שמקורו לרוב בחקלאות או שפכים. מגמות עולות לאורך זמן עשויות להאיץ פריחת אצות ולהפחית את איכות המים.'
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
          )}

          {activeChart === 'ecoli' && (
            <div className="h-[28rem]">
              {chartData.beaches.length ? (
                <Bar
                  key="ecoli-bar"
                  data={{
                    labels: chartData.beaches.map(b => b.beach.length>18 ? b.beach.slice(0,18)+'…' : b.beach),
                    datasets: [{
                      label: 'Avg E.coli',
                      data: chartData.beaches.map(b => b.average),
                      backgroundColor: 'rgba(249,115,22,0.7)',
                      borderColor: 'rgb(249,115,22)',
                      borderWidth: 1.5,
                      borderRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 800 },
                    plugins: {
                      legend: { display: false },
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
                            'E.coli הוא מדד לזיהום צואתי ולסיכון בריאותי ברחצה. ערכים גבוהים מעידים על סיכון מוגבר ונדרשת זהירות בחופי רחצה.'
                          ]
                        }
                      }
                    },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              ) : <p className="text-center text-gray-500">No E.coli data available</p>}
            </div>
          )}

          {activeChart === 'metals' && (
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
                              'ריכוזי מתכות כבדות (µg/L), העלולות להיות רעילות גם ברמות נמוכות, מוצגות כאן כממוצע לפי עומק.'
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
          )}
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