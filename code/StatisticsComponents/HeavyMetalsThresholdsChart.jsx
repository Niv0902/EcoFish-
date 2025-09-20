

import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

// Safety thresholds for each metal
const METAL_THRESHOLDS = {
  Cd: 0.005,
  Pb: 0.01,
  Hg: 1,
  Cu: 1,
  Zn: 10,
  Fe: 300,
  Mn: 50,
  Al: 200,
};

function extractYearlyMetalAverages(heavyMetals, year) {
  // For each metal, collect all values for the selected year only
  const metalValues = {};
  Object.keys(METAL_THRESHOLDS).forEach(metal => {
    metalValues[metal] = [];
  });
  Object.keys(heavyMetals).forEach(depth => {
    const yearObj = heavyMetals[depth][year];
    if (!yearObj || !Array.isArray(yearObj)) return;
    yearObj.forEach(monthObj => {
      if (!monthObj || typeof monthObj !== 'object') return;
      Object.keys(monthObj).forEach(dayKey => {
        const daySamples = monthObj[dayKey];
        if (!Array.isArray(daySamples)) return;
        daySamples.forEach(sample => {
          if (!sample || typeof sample !== 'object') return;
          // Support both keys like 'Al_µg_L' and 'Al' (if present)
          Object.keys(METAL_THRESHOLDS).forEach(metal => {
            const key1 = metal + '_µg_L';
            const key2 = metal;
            let value = sample[key1];
            if (typeof value !== 'number') value = sample[key2];
            if (typeof value === 'number') {
              metalValues[metal].push(value);
            }
          });
        });
      });
    });
  });
  // Calculate per-metal averages for the selected year
  const metalsThresholds = Object.keys(METAL_THRESHOLDS).map(metal => ({
    metal,
    label: metal,
    value: metalValues[metal].length ? metalValues[metal].reduce((a, b) => a + b, 0) / metalValues[metal].length : null,
    threshold: METAL_THRESHOLDS[metal],
  }));
  return metalsThresholds;
}

const HeavyMetalsThresholdsChart = () => {
  const [firebaseData, setFirebaseData] = useState(null);
  const [allYears, setAllYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2020');
  const [metalsThresholds, setMetalsThresholds] = useState([]);

  useEffect(() => {
    // Fetch heavy metals data from Firebase Realtime Database
    const heavyMetalsRef = ref(db, 'Heavy_Metals');
    const unsubscribe = onValue(heavyMetalsRef, (snapshot) => {
      const data = snapshot.val();
      setFirebaseData(data);
      // Extract all years
      const yearsSet = new Set();
      Object.values(data).forEach(depthObj => {
        Object.keys(depthObj).forEach(year => {
          yearsSet.add(year);
        });
      });
      const yearsArr = Array.from(yearsSet).sort();
      setAllYears(yearsArr);
      if (yearsArr.length > 0) setSelectedYear(yearsArr[0]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseData || !selectedYear) return;
    setMetalsThresholds(extractYearlyMetalAverages(firebaseData, selectedYear));
  }, [firebaseData, selectedYear]);

  const metals = metalsThresholds.map(d => d.metal);
  const measuredValues = metalsThresholds.map(d => d.value);
  const thresholds = metalsThresholds.map(d => d.threshold);

  const data = {
    labels: metals,
    datasets: [
      {
        label: `Measured Value (${selectedYear}) (µg/L)`,
        data: measuredValues,
        backgroundColor: measuredValues.map((v, i) => v !== null && v > thresholds[i] ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.7)'),
        borderColor: measuredValues.map((v, i) => v !== null && v > thresholds[i] ? 'rgba(239,68,68,1)' : 'rgba(34,197,94,1)'),
        borderWidth: 2,
      },
      {
        label: 'Safety Threshold (µg/L)',
        data: thresholds,
        backgroundColor: 'rgba(59,130,246,0.5)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, family: 'inherit', weight: 'bold' },
          padding: 12,
          boxWidth: 16,
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: `Heavy Metals vs Safety Thresholds (${selectedYear})`,
        font: { size: 16, weight: 'bold' },
        color: '#1e293b',
        padding: { top: 10, bottom: 10 },
      },
      tooltip: {
        bodyFont: { size: 12 },
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Safety Threshold (µg/L)') {
              return `Threshold: ${context.parsed.y} µg/L`;
            }
            return `Measured: ${context.parsed.y} µg/L`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#374151',
        anchor: 'end',
        align: 'top',
        font: {
          weight: 'bold',
          size: 13
        },
        offset: -4,
        clip: false,
        formatter: function(value, context) {
          // Only show label for measured values (first dataset)
          if (context.datasetIndex === 0 && value !== null && value !== undefined) {
            return value.toFixed(2);
          }
          return '';
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Concentration (µg/L)',
          font: { size: 13, weight: 'bold' },
        },
        ticks: {
          font: { size: 11 },
        },
        grid: { color: 'rgba(239,68,68,0.1)' }
      },
      x: {
        title: {
          display: true,
          text: 'Metal',
          font: { size: 13, weight: 'bold' },
        },
        ticks: {
          font: { size: 11 },
        },
        grid: { color: 'rgba(59,130,246,0.1)' }
      }
    }
  };

  const metalExplanations = {
    Cd: 'Cadmium (Cd): Toxic to kidneys and aquatic life. Safety threshold: 0.005 µg/L.',
    Pb: 'Lead (Pb): Affects nervous system, dangerous for children and wildlife. Safety threshold: 0.01 µg/L.',
    Hg: 'Mercury (Hg): Causes neurological and developmental problems. Safety threshold: 1 µg/L.',
    Cu: 'Copper (Cu): Can cause gastrointestinal distress and is toxic to fish. Safety threshold: 1 µg/L.',
    Zn: 'Zinc (Zn): Essential but toxic at high concentrations. Safety threshold: 10 µg/L.',
    Fe: 'Iron (Fe): Excess can affect taste and stain water, but is less toxic. Safety threshold: 300 µg/L.',
    Mn: 'Manganese (Mn): Can affect taste and stain water, high levels may be neurotoxic. Safety threshold: 50 µg/L.',
    Al: 'Aluminum (Al): Can be toxic to fish and affect water clarity. Safety threshold: 200 µg/L.'
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center">
        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-0">Select Year</label>
        <select
          className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-auto"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
        >
          {allYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="w-full h-[22rem] sm:h-[26rem] md:h-[30rem]">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} />
      </div>
      <div className="mt-4 text-xs sm:text-sm md:text-base text-gray-600 text-left break-words">
        Bars above the blue line exceed safety thresholds and may pose health risks. Green bars are safe, red bars are unsafe.
      </div>
      <ul className="mt-4 text-xs sm:text-sm md:text-base text-gray-700 text-left break-words">
        {metalsThresholds.map((metal) => (
          <li key={metal.metal} className="mb-2">
            <b className="font-semibold text-xs sm:text-sm md:text-base">{metal.label}</b> <span className="font-mono">({metal.metal})</span>: {metalExplanations[metal.metal]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeavyMetalsThresholdsChart;
import React from 'react';
