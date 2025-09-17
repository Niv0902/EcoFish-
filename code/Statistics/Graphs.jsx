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
  const [beachSearchQuery, setBeachSearchQuery] = useState('');
  
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
    
    // New: collect data by year
    const yearlyData = {}; // { year: { chlorophyll: [], nitrate: [], ecoli: [] } }

    // ---- Chemicals_Height traversal ----
    Object.keys(chemicalData || {}).forEach(year => {
      const monthsArr = chemicalData[year];
      if (!Array.isArray(monthsArr)) return;
      
      // Initialize yearly data for this year
      if (!yearlyData[year]) {
        yearlyData[year] = { chlorophyll: [], nitrate: [], ecoli: [] };
      }
      
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
              const value = Number(sample.chl_ug_l_avg);
              chlorophyll.push({ date, value, year });
              yearlyData[year].chlorophyll.push(value);
            }
            if (sample.avg_nitrate != null && !isNaN(sample.avg_nitrate)) {
              const value = Number(sample.avg_nitrate);
              nitrate.push({ date, value, year });
              yearlyData[year].nitrate.push(value);
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
      
      // Initialize yearly data for this year
      if (!yearlyData[year]) {
        yearlyData[year] = { chlorophyll: [], nitrate: [], ecoli: [] };
      }
      
      monthsArr.forEach((monthObj, monthIndex) => {
        if (!isObject(monthObj)) return;
        Object.keys(monthObj).forEach(dayKey => {
          const samplesArr = monthObj[dayKey];
          if (!Array.isArray(samplesArr)) return;
          samplesArr.forEach(sample => {
            if (!isObject(sample)) return;
            const beach = sample.beach_name || sample.beach || 'Unknown';
            if (sample.Ecoli != null && !isNaN(sample.Ecoli)) {
              const value = Number(sample.Ecoli);
              const entry = beachesMap.get(beach) || { values: [], count: 0 };
              entry.values.push(value);
              entry.count += 1;
              beachesMap.set(beach, entry);
              
              // Add to yearly data
              yearlyData[year].ecoli.push(value);
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

    // Process yearly data for summary charts
    const yearlyAverages = Object.keys(yearlyData).sort().map(year => {
      const data = yearlyData[year];
      return {
        year,
        chlorophyllAvg: data.chlorophyll.length > 0 ? data.chlorophyll.reduce((s,v) => s+v, 0) / data.chlorophyll.length : 0,
        nitrateAvg: data.nitrate.length > 0 ? data.nitrate.reduce((s,v) => s+v, 0) / data.nitrate.length : 0,
        ecoliAvg: data.ecoli.length > 0 ? data.ecoli.reduce((s,v) => s+v, 0) / data.ecoli.length : 0,
        sampleCount: data.chlorophyll.length + data.nitrate.length + data.ecoli.length
      };
    }).filter(item => item.sampleCount > 0);

    console.log('[chartData] counts', { chlorophyll: chlorophyll.length, nitrate: nitrate.length, beaches: beaches.length, metals: metals.length, yearlyAverages: yearlyAverages.length });

    return { chlorophyll, nitrate, beaches, metals, metalList, perDepthMetal, yearlyAverages };
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

        {/* Statistics Overview - Hidden for E.coli tab */}
        {activeChart !== 'ecoli' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Analysis</h3>
                  <p className="text-4xl font-bold text-green-600">{(chartData.chlorophyll?.length || 0) + (chartData.nitrate?.length || 0)}</p>
                  <p className="text-gray-500 mt-1">{(chartData.chlorophyll?.length || 0)} Chlorophyll + {(chartData.nitrate?.length || 0)} Nitrate samples</p>
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
                  <p className="text-gray-500 mt-1">{chartData.beaches?.length || 0} beach monitoring locations</p>
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
                  <p className="text-gray-500 mt-1">{chartData.metals?.length || 0} different metal types detected</p>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚗️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          {[
            { id: 'chemicals', label: 'Chemicals (Scatter)' },
            { id: 'ecoli', label: 'E.coli by Beach' },
            { id: 'metals', label: 'Heavy Metals by Depth' },
            { id: 'yearly', label: 'Yearly Trends' }
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
                <label className="text-sm text-gray-600">Select metric:</label>
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
          )}

          {activeChart === 'yearly' && (
            <div>
              <div className="h-[28rem] mb-8">
                {chartData.yearlyAverages && chartData.yearlyAverages.length ? (
                <Line
                  key="yearly-trends"
                  data={{
                    labels: chartData.yearlyAverages.map(d => d.year),
                    datasets: [
                      {
                        label: 'Chlorophyll-a Avg (µg/L)',
                        data: chartData.yearlyAverages.map(d => d.chlorophyllAvg || null),
                        borderColor: 'rgba(34,197,94,0.9)',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        yAxisID: 'y',
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      },
                      {
                        label: 'Nitrate Avg (mg/L)',
                        data: chartData.yearlyAverages.map(d => d.nitrateAvg || null),
                        borderColor: 'rgba(59,130,246,0.9)',
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        yAxisID: 'y1',
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      },
                      {
                        label: 'E.coli Avg',
                        data: chartData.yearlyAverages.map(d => d.ecoliAvg || null),
                        borderColor: 'rgba(249,115,22,0.9)',
                        backgroundColor: 'rgba(249,115,22,0.1)',
                        yAxisID: 'y2',
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 8
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: hasAnimated ? false : { duration: 800 },
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: {
                        backgroundColor: 'rgba(243,244,246,0.95)',
                        titleColor: '#111827',
                        bodyColor: '#374151',
                        borderColor: '#9CA3AF',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                          afterBody: () => [

                            'Annual trends show average environmental indicators over the years. This helps identify long-term patterns in water quality changes and environmental health.'
                          ]
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Year'
                        }
                      },
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Chlorophyll-a (µg/L)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                          display: true,
                          text: 'Nitrate (mg/L)'
                        },
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                      y2: {
                        type: 'logarithmic',
                        display: false,
                        position: 'right',
                      }
                    }
                  }}
                />
              ) : (
                <p className="text-center text-gray-500">No yearly data available</p>
              )}
              </div>
              
              {/* Detailed Trend Analysis - Only in yearly trends tab */}
              {chartData.yearlyAverages && chartData.yearlyAverages.length > 1 && (
                <div className="mt-8 space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      Environmental Concerns & Degradation Trends
                    </h3>
                    
                    {(() => {
                      const years = chartData.yearlyAverages;
                      const concerns = [];
                      
                      // Analyze each year for specific concerns
                      years.forEach((yearData, index) => {
                        const currentYear = yearData;
                        const prevYear = index > 0 ? years[index - 1] : null;
                        
                        // Check for year-over-year spikes
                        if (prevYear) {
                          // Chlorophyll spike detection
                          if (prevYear.chlorophyllAvg > 0) {
                            const chlorophyllSpike = ((currentYear.chlorophyllAvg - prevYear.chlorophyllAvg) / prevYear.chlorophyllAvg * 100);
                            if (chlorophyllSpike > 50) {
                              concerns.push({
                                type: "Eutrophication Crisis",
                                icon: "🦠",
                                year: currentYear.year,
                                change: chlorophyllSpike,
                                description: `Massive chlorophyll-a spike in ${currentYear.year}: ${chlorophyllSpike.toFixed(1)}% increase from previous year`,
                                values: `${prevYear.chlorophyllAvg.toFixed(2)} → ${currentYear.chlorophyllAvg.toFixed(2)} µg/L`,
                                impact: "Severe algal blooms, oxygen depletion, fish kills, and ecosystem collapse",
                                causes: "Agricultural runoff peak, sewage overflow, or fertilizer dumping"
                              });
                            }
                          }
                          
                          // Nitrate spike detection
                          if (prevYear.nitrateAvg > 0) {
                            const nitrateSpike = ((currentYear.nitrateAvg - prevYear.nitrateAvg) / prevYear.nitrateAvg * 100);
                            if (nitrateSpike > 40) {
                              concerns.push({
                                type: "Nutrient Pollution Crisis",
                                icon: "☠️",
                                year: currentYear.year,
                                change: nitrateSpike,
                                description: `Critical nitrate contamination in ${currentYear.year}: ${nitrateSpike.toFixed(1)}% surge`,
                                values: `${prevYear.nitrateAvg.toFixed(2)} → ${currentYear.nitrateAvg.toFixed(2)} mg/L`,
                                impact: "Groundwater contamination, drinking water unsafe, blue baby syndrome risk",
                                causes: "Intensive farming season, fertilizer overuse, or livestock waste event"
                              });
                            }
                          }
                          
                          // E.coli outbreak detection
                          if (prevYear.ecoliAvg > 0) {
                            const ecoliSpike = ((currentYear.ecoliAvg - prevYear.ecoliAvg) / prevYear.ecoliAvg * 100);
                            if (ecoliSpike > 100) {
                              concerns.push({
                                type: "Fecal Contamination Outbreak",
                                icon: "🚫",
                                year: currentYear.year,
                                change: ecoliSpike,
                                description: `E.coli outbreak in ${currentYear.year}: ${ecoliSpike.toFixed(1)}% explosion`,
                                values: `${prevYear.ecoliAvg.toFixed(0)} → ${currentYear.ecoliAvg.toFixed(0)} CFU/100mL`,
                                impact: "Beach closures, waterborne diseases, tourism losses, public health emergency",
                                causes: "Sewage system failure, septic overflow, or storm-related contamination"
                              });
                            }
                          }
                        }
                        
                        // Check for absolute high values in specific years
                        if (currentYear.chlorophyllAvg > 30) {
                          concerns.push({
                            type: "Severe Eutrophication Event",
                            icon: "🌊",
                            year: currentYear.year,
                            change: null,
                            description: `Extremely high chlorophyll levels in ${currentYear.year}: ${currentYear.chlorophyllAvg.toFixed(2)} µg/L`,
                            values: `Critical threshold exceeded (>30 µg/L)`,
                            impact: "Massive algal blooms, dead zones, complete ecosystem disruption",
                            causes: "Perfect storm of nutrients, temperature, and weather conditions"
                          });
                        }
                        
                        if (currentYear.nitrateAvg > 10) {
                          concerns.push({
                            type: "Nitrate Contamination Alert",
                            icon: "⚠️",
                            year: currentYear.year,
                            change: null,
                            description: `Dangerous nitrate levels in ${currentYear.year}: ${currentYear.nitrateAvg.toFixed(2)} mg/L`,
                            values: `EPA limit exceeded (>10 mg/L)`,
                            impact: "Drinking water unsafe, infant health risks, environmental degradation",
                            causes: "Agricultural pollution peak or water treatment failure"
                          });
                        }
                        
                        if (currentYear.ecoliAvg > 1000) {
                          concerns.push({
                            type: "Health Crisis Alert",
                            icon: "🚨",
                            year: currentYear.year,
                            change: null,
                            description: `Extreme E.coli contamination in ${currentYear.year}: ${currentYear.ecoliAvg.toFixed(0)} CFU/100mL`,
                            values: `Swimming ban threshold exceeded (>1000 CFU/100mL)`,
                            impact: "Public health emergency, all water activities prohibited",
                            causes: "Major sewage incident or catastrophic system failure"
                          });
                        }
                      });
                      
                      // Remove duplicates and sort by year
                      const uniqueConcerns = concerns.filter((concern, index, self) => 
                        index === self.findIndex(c => c.year === concern.year && c.type === concern.type)
                      ).sort((a, b) => parseInt(b.year) - parseInt(a.year));
                      
                      if (uniqueConcerns.length === 0) {
                        return (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-medium">✅ No major environmental crises detected in specific years.</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="space-y-4">
                          {uniqueConcerns.map((concern, index) => (
                            <div key={index} className="bg-white border border-red-200 rounded-lg p-5 shadow-sm">
                              <h4 className="font-bold text-red-800 mb-2 flex items-center">
                                <span className="text-xl mr-2">{concern.icon}</span>
                                {concern.type} - {concern.year}
                                {concern.change && (
                                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                    +{concern.change.toFixed(1)}%
                                  </span>
                                )}
                              </h4>
                              <p className="text-gray-700 mb-2 font-medium">{concern.description}</p>
                              <p className="text-sm text-blue-700 mb-2"><strong>Values:</strong> {concern.values}</p>
                              <div className="text-sm space-y-1">
                                <p><strong className="text-red-700">Environmental Impact:</strong> {concern.impact}</p>
                                <p><strong className="text-orange-700">Likely Causes:</strong> {concern.causes}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Trend Analysis Cards */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">📈</span>
                      Detailed Trend Analysis ({chartData.yearlyAverages[0].year}-{chartData.yearlyAverages[chartData.yearlyAverages.length - 1].year})
                    </h3>
                    
                    {(() => {
                      const years = chartData.yearlyAverages;
                      const firstYear = years[0];
                      const lastYear = years[years.length - 1];
                      
                      const chlorophyllChange = firstYear.chlorophyllAvg > 0 ? 
                        ((lastYear.chlorophyllAvg - firstYear.chlorophyllAvg) / firstYear.chlorophyllAvg * 100) : 0;
                      const nitrateChange = firstYear.nitrateAvg > 0 ? 
                        ((lastYear.nitrateAvg - firstYear.nitrateAvg) / firstYear.nitrateAvg * 100) : 0;
                      const ecoliChange = firstYear.ecoliAvg > 0 ? 
                        ((lastYear.ecoliAvg - firstYear.ecoliAvg) / firstYear.ecoliAvg * 100) : 0;
                      
                      const getTrendIcon = (change) => {
                        if (Math.abs(change) < 5) return "➡️";
                        return change > 0 ? "📈" : "📉";
                      };
                      
                      const getTrendColor = (change, isGoodWhenLow = false) => {
                        if (Math.abs(change) < 5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
                        const isIncreasing = change > 0;
                        if (isGoodWhenLow) {
                          return isIncreasing ? "text-red-700 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200";
                        } else {
                          return isIncreasing ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200";
                        }
                      };
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className={`rounded-lg p-4 border-2 ${getTrendColor(chlorophyllChange, true)}`}>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <span className="mr-2">{getTrendIcon(chlorophyllChange)}</span>
                              Chlorophyll-a
                            </h4>
                            <p className="text-sm">
                              {Math.abs(chlorophyllChange).toFixed(1)}% change<br/>
                              {firstYear.chlorophyllAvg.toFixed(2)} → {lastYear.chlorophyllAvg.toFixed(2)} µg/L
                            </p>
                          </div>
                          
                          <div className={`rounded-lg p-4 border-2 ${getTrendColor(nitrateChange, true)}`}>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <span className="mr-2">{getTrendIcon(nitrateChange)}</span>
                              Nitrate
                            </h4>
                            <p className="text-sm">
                              {Math.abs(nitrateChange).toFixed(1)}% change<br/>
                              {firstYear.nitrateAvg.toFixed(2)} → {lastYear.nitrateAvg.toFixed(2)} mg/L
                            </p>
                          </div>
                          
                          <div className={`rounded-lg p-4 border-2 ${getTrendColor(ecoliChange, true)}`}>
                            <h4 className="font-semibold mb-2 flex items-center">
                              <span className="mr-2">{getTrendIcon(ecoliChange)}</span>
                              E.coli
                            </h4>
                            <p className="text-sm">
                              {Math.abs(ecoliChange).toFixed(1)}% change<br/>
                              {firstYear.ecoliAvg.toFixed(0)} → {lastYear.ecoliAvg.toFixed(0)} CFU/100mL
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeChart === 'ecoli' && (
            <div className="h-[28rem]">
              {chartData.beaches.length ? (
                <div className="h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 text-center">E.coli Contamination Heatmap by Beach</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">🔍 Search:</span>
                      <input
                        type="text"
                        placeholder="Filter beaches..."
                        value={beachSearchQuery}
                        onChange={(e) => setBeachSearchQuery(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {beachSearchQuery && (
                        <button
                          onClick={() => setBeachSearchQuery('')}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    {(() => {
                      // Filter beaches based on search query
                      const filteredBeaches = chartData.beaches.filter(beach =>
                        beach.beach.toLowerCase().includes(beachSearchQuery.toLowerCase())
                      );
                      
                      if (filteredBeaches.length === 0) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <div className="text-4xl mb-2">🏖️</div>
                              <p>No beaches found matching "{beachSearchQuery}"</p>
                              <button 
                                onClick={() => setBeachSearchQuery('')}
                                className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                              >
                                Clear search to see all beaches
                              </button>
                            </div>
                          </div>
                        );
                      }
                      
                      // Calculate optimal grid layout
                      const numBeaches = filteredBeaches.length;
                      const columns = Math.ceil(Math.sqrt(numBeaches));
                      const rows = Math.ceil(numBeaches / columns);
                      
                      return (
                        <div className="h-full p-2">
                          <div 
                            className="grid gap-3 h-full"
                            style={{
                              gridTemplateColumns: `repeat(${Math.min(columns, 6)}, 1fr)`,
                              gridAutoRows: 'minmax(90px, auto)'
                            }}
                          >
                            {filteredBeaches.map((beach, index) => {
                              // Calculate color intensity based on E.coli levels
                              const maxEcoli = Math.max(...chartData.beaches.map(b => b.average));
                              const minEcoli = Math.min(...chartData.beaches.map(b => b.average));
                              const normalizedValue = (beach.average - minEcoli) / (maxEcoli - minEcoli);
                              
                              // Color scheme: green (low) -> yellow (medium) -> red (high)
                              let backgroundColor;
                              let textColor = 'white';
                              let riskLevel;
                              
                              if (normalizedValue < 0.33) {
                                backgroundColor = `rgba(34, 197, 94, ${0.3 + normalizedValue * 0.7})`;
                                riskLevel = 'Low Risk';
                                if (normalizedValue < 0.15) textColor = 'black';
                              } else if (normalizedValue < 0.66) {
                                backgroundColor = `rgba(251, 191, 36, ${0.5 + (normalizedValue - 0.33) * 0.5})`;
                                riskLevel = 'Medium Risk';
                                textColor = 'black';
                              } else {
                                backgroundColor = `rgba(239, 68, 68, ${0.6 + (normalizedValue - 0.66) * 0.4})`;
                                riskLevel = 'High Risk';
                              }
                              
                              return (
                                <div
                                  key={index}
                                  className="rounded-lg p-3 border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-sm flex flex-col justify-center items-center min-h-[90px]"
                                  style={{ backgroundColor }}
                                  title={`${beach.beach}: ${beach.average.toFixed(0)} CFU/100mL - ${riskLevel}`}
                                >
                                  <div className="text-center w-full">
                                    <div className={`text-xs font-medium mb-1 leading-tight`} style={{ color: textColor }}>
                                      {beach.beach.length > 12 ? beach.beach.slice(0, 12) + '...' : beach.beach}
                                    </div>
                                    <div className={`text-lg font-bold mb-1`} style={{ color: textColor }}>
                                      {beach.average.toFixed(0)}
                                    </div>
                                    <div className={`text-xs`} style={{ color: textColor }}>
                                      CFU/100mL
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Legend and Info */}
                  <div className="mt-4 px-4 border-t pt-4">
                    <div className="flex items-center justify-center space-x-6 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm text-gray-600">Low Risk (Safe)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-yellow-500"></div>
                        <span className="text-sm text-gray-600">Medium Risk (Caution)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm text-gray-600">High Risk (Unsafe)</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-500">
                      E.coli levels indicate fecal contamination. Higher values mean greater health risks for swimming.
                      {beachSearchQuery && ` | Showing ${chartData.beaches.filter(beach => beach.beach.toLowerCase().includes(beachSearchQuery.toLowerCase())).length} of ${chartData.beaches.length} beaches`}
                    </p>
                  </div>
                </div>
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
          )}
        </div>

        {/* Footer */}
      </div>
    </div>
  );
};

export default Graphs;