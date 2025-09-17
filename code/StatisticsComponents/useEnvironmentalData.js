import { useEffect, useState, useMemo } from 'react';
import { db } from '../firebase.js';
import { ref as dbRef, onValue, off } from 'firebase/database';

export const useEnvironmentalData = () => {
  const [chemicalData, setChemicalData] = useState({});
  const [ecofloodsData, setEcofloodsData] = useState({});
  const [heavyMetalsData, setHeavyMetalsData] = useState({});
  const [loading, setLoading] = useState(true);

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

  // Process and transform data
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

  return {
    chartData,
    loading
  };
};