import React, { useMemo } from 'react';
import { Scatter, Bar } from 'react-chartjs-2';

// Helper to extract all chemical samples
function extractSamples() {
  const samples = [];
  const chemicals = data.Chemicals_Height;
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

const samples = extractSamples();

export function ChlorophyllVsNitrateScatter() {
  const chartData = useMemo(() => ({
    datasets: [{
      label: 'Chlorophyll-a vs. Nitrate',
      data: samples
        .filter(s => s.chl_ug_l_avg != null && s.avg_nitrate != null)
        .map(s => ({ x: s.avg_nitrate, y: s.chl_ug_l_avg })),
      backgroundColor: 'rgba(59,130,246,0.7)',
      pointRadius: 4
    }]
  }), []);

  return (
    <div className="h-[24rem]">
      <h3 className="mb-2 font-semibold text-lg text-gray-800">Chlorophyll-a vs. Nitrate (Scatter)</h3>
      <Scatter
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `Nitrate: ${ctx.parsed.x}, Chlorophyll-a: ${ctx.parsed.y}`
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Nitrate (mg/L)' } },
            y: { title: { display: true, text: 'Chlorophyll-a (µg/L)' } }
          }
        }}
      />
      <div className="mt-2 text-sm text-gray-600">Shows the relationship between nitrate and chlorophyll-a concentrations. Points clustered together may indicate correlation between nutrient pollution and algal growth.</div>
    </div>
  );
}

export function ChemicalExtremesBar() {
  // Find max/min for each chemical by year
  const yearly = {};
  samples.forEach(s => {
    if (!yearly[s.year]) yearly[s.year] = { chl: [], nitrate: [], nitrit: [] };
    if (s.chl_ug_l_avg != null) yearly[s.year].chl.push(s.chl_ug_l_avg);
    if (s.avg_nitrate != null) yearly[s.year].nitrate.push(s.avg_nitrate);
    if (s.avg_nitrit != null) yearly[s.year].nitrit.push(s.avg_nitrit);
  });
  const years = Object.keys(yearly).sort();
  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Max Chlorophyll-a',
        data: years.map(y => Math.max(...yearly[y].chl)),
        backgroundColor: 'rgba(34,197,94,0.7)'
      },
      {
        label: 'Min Chlorophyll-a',
        data: years.map(y => Math.min(...yearly[y].chl)),
        backgroundColor: 'rgba(34,197,94,0.2)'
      },
      {
        label: 'Max Nitrate',
        data: years.map(y => Math.max(...yearly[y].nitrate)),
        backgroundColor: 'rgba(59,130,246,0.7)'
      },
      {
        label: 'Min Nitrate',
        data: years.map(y => Math.min(...yearly[y].nitrate)),
        backgroundColor: 'rgba(59,130,246,0.2)'
      },
      {
        label: 'Max Nitrite',
        data: years.map(y => Math.max(...yearly[y].nitrit)),
        backgroundColor: 'rgba(251,191,36,0.7)'
      },
      {
        label: 'Min Nitrite',
        data: years.map(y => Math.min(...yearly[y].nitrit)),
        backgroundColor: 'rgba(251,191,36,0.2)'
      }
    ]
  };

  return (
    <div className="h-[24rem]">
      <h3 className="mb-2 font-semibold text-lg text-gray-800">Chemical Extremes by Year</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
              }
            }
          },
          scales: {
            x: { title: { display: true, text: 'Year' } },
            y: { title: { display: true, text: 'Concentration' } }
          }
        }}
      />
      <div className="mt-2 text-sm text-gray-600">Shows the highest and lowest measured values for each chemical per year. Helps identify extreme pollution events and clean periods.</div>
    </div>
  );
}
