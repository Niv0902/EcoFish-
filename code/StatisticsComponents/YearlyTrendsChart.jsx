import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { FileImage } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BeautifulYearlyTrendsChart = ({ chartData }) => {
  const [showMetals, setShowMetals] = useState(false);
  const chartRef = React.useRef(null);

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart && typeof chart.toBase64Image === "function") {
      const url = chart.toBase64Image("image/jpeg", 1.0);
      const link = document.createElement("a");
      link.href = url;
      link.download = "YearlyTrendsChart.jpg";
      link.click();
    } else {
      alert("Chart image download not supported in this browser.");
    }
  };

  if (!chartData?.yearlyAverages?.length) {
    return <p className="text-center text-gray-500">No yearly data available</p>;
  }

  // Separate filters for chemicals and heavy metals
  const filteredChemicals = chartData.yearlyAverages
    .map((d) => ({
      year: Number(d.year),
      chlorophyllAvg: d.chlorophyllAvg ?? null,
      nitrateAvg: d.nitrateAvg ?? null,
      avg_nitrit: d.avg_nitrit ?? null,
    }))
    .filter((d) => d.year >= 2010 && d.year <= 2020);

  const filteredMetals = chartData.yearlyAverages
    .map((d) => ({
      year: Number(d.year),
      avg_Cd: d.avg_Cd ?? null,
      avg_Pb: d.avg_Pb ?? null,
      avg_Hg: d.avg_Hg ?? null,
      avg_Cu: d.avg_Cu ?? null,
      avg_Zn: d.avg_Zn ?? null,
      avg_Fe: d.avg_Fe ?? null,
      avg_Mn: d.avg_Mn ?? null,
      avg_Al: d.avg_Al ?? null,
    }))
    .filter((d) => d.year >= 2020 && d.year <= 2023);

  // Use correct filtered data based on toggle
  const filtered = showMetals ? filteredMetals : filteredChemicals;

  if (!filtered.length) {
    return <p className="text-center text-gray-500">No data in {showMetals ? '2020–2023' : '2010–2020'}</p>;
  }

  const years = filtered.map((d) => d.year);
  const chlorophyllData = showMetals ? [] : filtered.map((d) => d.chlorophyllAvg);
  const nitrateData = showMetals ? [] : filtered.map((d) => d.nitrateAvg);
  const nitritData = showMetals ? [] : filtered.map((d) => d.avg_nitrit);
  // Heavy metals
  const metalsList = [
    { key: "avg_Cd", label: "Cadmium (Cd)", color: "rgba(220,38,127,1)" },
    { key: "avg_Pb", label: "Lead (Pb)", color: "rgba(239,68,68,1)" },
    { key: "avg_Hg", label: "Mercury (Hg)", color: "rgba(251,191,36,1)" },
    { key: "avg_Cu", label: "Copper (Cu)", color: "rgba(59,130,246,1)" },
    { key: "avg_Zn", label: "Zinc (Zn)", color: "rgba(34,197,94,1)" },
    { key: "avg_Fe", label: "Iron (Fe)", color: "rgba(16,185,129,1)" },
    { key: "avg_Mn", label: "Manganese (Mn)", color: "rgba(168,85,247,1)" },
    { key: "avg_Al", label: "Aluminum (Al)", color: "rgba(100,116,139,1)" },
  ];
  const metalsData = metalsList.map(m => ({
    ...m,
    data: filtered.map(d => d[m.key] ?? null)
  }));

  // Prepare ranges safely
  const num = (x) => (typeof x === "number" && isFinite(x) ? x : null);
  const allChl = chlorophyllData.map(num).filter((v) => v !== null);
  const allNO3 = nitrateData.map(num).filter((v) => v !== null);
  const allNO2 = nitritData.map(num).filter((v) => v !== null);

  const padMax = (arr, fallback = 1) =>
    (arr.length ? Math.max(...arr) : fallback) * 1.2;

  const chlorophyllMax = padMax(allChl, 1);
  const nitrateMax = padMax(allNO3, 1);
  const nitritMax = padMax(allNO2, 1);

  // Gradients
  const createGradient = (canvas, c0, c1) => {
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
    gradient.addColorStop(0, c0);
    gradient.addColorStop(1, c1);
    return gradient;
  };

  const gradientChartData = showMetals
    ? {
        labels: years,
        datasets: metalsData.map((m, idx) => ({
          label: m.label,
          data: m.data,
          borderColor: m.color,
          backgroundColor: (ctx) => createGradient(ctx.chart.canvas, m.color.replace('1)', '0.7)'), m.color.replace('1)', '0.1)')),
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: m.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: m.color,
          pointHoverBorderWidth: 3,
          yAxisID: 'y',
          spanGaps: true,
        }))
      }
    : {
        labels: years,
        datasets: [
          {
            label: "Chloride (µg/L)",
            data: chlorophyllData,
            borderColor: "rgba(34,197,94,1)",
            backgroundColor: (ctx) =>
                createGradient(ctx.chart.canvas, "rgba(34,197,94,0.8)", "rgba(34,197,94,0.1)"),
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: "rgba(34,197,94,1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 3,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(34,197,94,1)",
            pointHoverBorderWidth: 3,
            yAxisID: "y",
            spanGaps: true,
          },
          {
            label: "Nitrate (µg/L)",
            data: nitrateData,
            borderColor: "rgba(59,130,246,1)",
            backgroundColor: (ctx) =>
                createGradient(ctx.chart.canvas, "rgba(59,130,246,0.6)", "rgba(59,130,246,0.05)"),
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: "rgba(59,130,246,1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 3,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(59,130,246,1)",
            pointHoverBorderWidth: 3,
            yAxisID: "y1",
            spanGaps: true,
          },
          {
            label: "Nitrite (µg/L)",
            data: nitritData,
            borderColor: "rgba(251,191,36,1)",
            backgroundColor: (ctx) =>
                createGradient(ctx.chart.canvas, "rgba(251,191,36,0.6)", "rgba(251,191,36,0.05)"),
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: "rgba(251,191,36,1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 3,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(251,191,36,1)",
            pointHoverBorderWidth: 3,
            yAxisID: "y2",
            spanGaps: true,
          },
        ],
      };

  const gradientOptions = showMetals
    ? {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: "easeInOutQuart" },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 14, weight: "bold" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.95)",
            titleColor: "#1f2937",
            bodyColor: "#374151",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              afterBody: () => [
                "Annual heavy metals concentrations (µg/L) by year."
              ],
            },
          },
          title: { display: false },
        },
        scales: {
          x: {
            title: { display: true, text: "Year", font: { size: 16, weight: "bold" } },
            grid: { color: "rgba(0,0,0,0.05)", lineWidth: 1 },
            ticks: { font: { size: 12 } },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Concentration (µg/L)",
              font: { size: 14, weight: "bold" },
              color: "#be185d",
            },
            grid: { color: "rgba(220,38,127,0.1)", lineWidth: 1 },
            ticks: { color: "#be185d", font: { size: 11, weight: "bold" } },
            min: 0,
            // max: metalsMax, // Optionally calculate max
          },
        },
        interaction: { mode: "index", intersect: false },
        hover: { mode: "nearest", intersect: false, animationDuration: 200 },
      }
    : {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 14, weight: "bold" },
            },
          },
          tooltip: {
            backgroundColor: "rgba(255,255,255,0.95)",
            titleColor: "#1f2937",
            bodyColor: "#374151",
            borderColor: "#e5e7eb",
            borderWidth: 1,
            cornerRadius: 12,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              afterBody: () => [
                "Annual environmental indicators showing water quality trends over time.",
              ],
            },
          },
          title: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Year",
              font: { size: 16, weight: "bold" },
            },
            grid: { color: "rgba(0,0,0,0.05)", lineWidth: 1 },
            ticks: { font: { size: 12 } },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Chloride (µg/L)",
              font: { size: 14, weight: "bold" },
              color: "rgba(34,197,94,1)",
            },
            grid: { color: "rgba(34,197,94,0.1)", lineWidth: 1 },
            ticks: { color: "rgba(34,197,94,1)", font: { size: 11, weight: "bold" } },
            min: 0,
            max: chlorophyllMax,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Nitrate (µg/L)",
              font: { size: 14, weight: "bold" },
              color: "rgba(59,130,246,1)",
            },
            grid: { drawOnChartArea: false, color: "rgba(59,130,246,0.1)" },
            ticks: { color: "rgba(59,130,246,1)", font: { size: 11, weight: "bold" } },
            min: 0,
            max: nitrateMax,
          },
          y2: {
            type: "linear",
            display: true,
            position: "right",
            offset: true,
            title: {
              display: true,
              text: "Nitrite (µg/L)",
              font: { size: 14, weight: "bold" },
              color: "rgba(251,191,36,1)",
            },
            grid: { drawOnChartArea: false, color: "rgba(251,191,36,0.1)" },
            ticks: { color: "rgba(251,191,36,1)", font: { size: 11, weight: "bold" } },
            min: 0,
            max: nitritMax,
          },
        },
        interaction: { mode: "index", intersect: false },
        hover: { mode: "nearest", intersect: false, animationDuration: 200 },
      };

  // Analysis helpers
  const analyzeChlorophyllTrends = () => {
    if (allChl.length < 2) return [];
    const trends = [];
    const maxVal = Math.max(...allChl);
    const maxIdx = chlorophyllData.findIndex((v) => v === maxVal);
    if (maxVal > 30) {
      trends.push({
        type: "peak",
        year: years[maxIdx],
        value: maxVal,
        description: `Peak eutrophication in ${years[maxIdx]}: chlorophyll-a reached ${maxVal.toFixed(
          1
        )} µg/L (algal bloom risk).`,
      });
    }
    const first = allChl[0];
    const last = allChl[allChl.length - 1];
    if (first && isFinite(first) && isFinite(last)) {
      const pct = ((last - first) / first) * 100;
      if (Math.abs(pct) > 20) {
        trends.push({
          type: "trend",
          change: pct,
          description: `Overall ${pct > 0 ? "increase" : "decrease"} of ${Math.abs(
            pct
          ).toFixed(1)}% in chlorophyll-a from ${years[0]} to ${
            years[years.length - 1]
          }.`,
        });
      }
    }
    return trends;
  };

  const analyzeNitrateTrends = () => {
    if (allNO3.length < 2) return [];
    const trends = [];
    const high = allNO3.filter((v) => v > 10);
    if (high.length > 0) {
      trends.push({
        type: "concern",
        description: `${high.length} year${
          high.length > 1 ? "s" : ""
        } exceeded 10 µg/L (EPA drinking-water limit) — likely runoff or sewage influence.`,
      });
    }
    const changes = [];
    for (let i = 1; i < allNO3.length; i++) {
      if (allNO3[i - 1] && allNO3[i]) {
        changes.push((Math.abs(allNO3[i] - allNO3[i - 1]) / allNO3[i - 1]) * 100);
      }
    }
    if (changes.length) {
      const avgVol = changes.reduce((a, b) => a + b, 0) / changes.length;
      if (avgVol > 30) {
        trends.push({
          type: "volatility",
          description: `High nitrate variability (${avgVol.toFixed(
            1
          )}% avg year-to-year change) suggests inconsistent pollution sources.`,
        });
      }
    }
    return trends;
  };

  const chlorophyllTrends = analyzeChlorophyllTrends();
  const nitrateTrends = analyzeNitrateTrends();

  return (
    <div className="space-y-6">
      {/* Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          className={`px-5 py-2 rounded-full font-semibold shadow transition-all border ${showMetals ? 'bg-pink-600 text-white border-pink-700' : 'bg-blue-600 text-white border-blue-700'}`}
          onClick={() => setShowMetals((v) => !v)}
        >
          {showMetals ? 'Show Chemicals' : 'Show Heavy Metals'}
        </button>
      </div>
      {/* Chart card */}
      <div className={`bg-gradient-to-br ${showMetals ? 'from-pink-50 via-white to-pink-100' : 'from-blue-50 via-white to-green-50'} rounded-2xl p-8 shadow-lg border border-gray-200`}>
        <div className="h-[36rem] mb-6">
          <Line ref={chartRef} data={gradientChartData} options={gradientOptions} />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {showMetals
              ? `Heavy metals trends from ${years[0]} to ${years[years.length - 1]}`
              : `Environmental trends from ${years[0]} to ${years[years.length - 1]}`}
          </div>
         <button
  className="px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
  onClick={() => {
    const chartInstance = chartRef.current?.chartInstance || chartRef.current?.instance || chartRef.current;
    if (chartInstance && chartInstance.toBase64Image) {
      const link = document.createElement('a');
      link.href = chartInstance.toBase64Image('image/jpeg', 1.0);
      link.download = `Yearly-Trends-Chart.jpg`;
      link.click();
    } else {
      alert('Chart image download not supported in this browser.');
    }
  }}
>
  Download
  <FileImage className="w-4 h-4" />
</button>
        </div>
      </div>

      {/* Trend Analysis Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">📊</span>
          {showMetals ? "Heavy Metals Analysis" : "Trend Analysis & Environmental Insights"}
        </h3>

        {showMetals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metalsData.map((m, idx) => (
              <div key={m.key} className="bg-pink-50 border border-pink-200 rounded-xl p-5">
                <h4 className="font-bold text-pink-800 mb-3 flex items-center">
                  <span className="w-4 h-4" style={{backgroundColor: m.color, borderRadius: '50%', marginRight: '8px'}}></span>
                  {m.label}
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-pink-700">Yearly average: {m.data.map((v, i) => v !== null ? `${years[i]}: ${v.toFixed(2)}` : null).filter(Boolean).join(', ')}</p>
                  <div className="mt-3 p-2 bg-pink-100 rounded text-xs text-pink-800">
                    <strong>Context:</strong> High levels of heavy metals can be toxic to aquatic life and humans. Trends may indicate pollution sources or sediment release.
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chloride Analysis */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <h4 className="font-bold text-green-800 mb-3 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                Chloride Trends
              </h4>
              <div className="space-y-2">
                {chlorophyllTrends.length ? (
                  chlorophyllTrends.map((t, i) => (
                    <div key={i} className="text-sm text-green-700">
                      <p className="leading-relaxed">{t.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-green-700">
                    Chloride levels show stable patterns within normal ranges.
                  </p>
                )}
                <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                  <strong>Context:</strong> Values above ~30 µg/L indicate eutrophication. Rising trends
                  suggest nutrient enrichment from agricultural/urban runoff.
                </div>
              </div>
            </div>

            {/* Nitrate Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
                Nitrate Patterns
              </h4>
              <div className="space-y-2">
                {nitrateTrends.length ? (
                  nitrateTrends.map((t, i) => (
                    <div key={i} className="text-sm text-blue-700">
                      <p className="leading-relaxed">{t.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-blue-700">
                    Nitrate levels remain within acceptable ranges with minimal variation.
                  </p>
                )}
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  <strong>Context:</strong> EPA limit ≈ 10 µg/L (drinking water). High values can indicate
                  fertilizer/ sewage contamination.
                </div>
              </div>
            </div>

            {/* Space for a third insight card (optional) */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
                <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                Nitrite Signals
              </h4>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Nitrite spikes may reflect active nitrification stages or episodic inputs. Track alongside
                nitrate and oxygen to interpret biogeochemical shifts.
              </p>
            </div>
          </div>
        )}

        {/* Overall Environmental Health Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h5 className="font-bold text-gray-800 mb-2">Environmental Health Summary</h5>
          <p className="text-sm text-gray-700 leading-relaxed">
            {showMetals
              ? "Heavy metals can accumulate in aquatic environments, posing risks to organisms and humans. Monitoring trends helps identify pollution sources and guide remediation."
              : "The multi-year trends reveal interconnected water-quality patterns. Chloride spikes often co-occur with increased nutrient loading, while E. coli outbreaks typically follow rain/flood events or infrastructure failures. Sustained improvements require integrated watershed management addressing both point and non-point pollution sources."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BeautifulYearlyTrendsChart;
