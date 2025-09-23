import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// Props: dataArr = array of { kineret_height, avg_nitrate, avg_nitrit, chl_ug_l_avg, date }
const KineretHeightChemScatter = ({ dataArr }) => {
  const chartRef = React.useRef(null);

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart && typeof chart.toBase64Image === "function") {
      const url = chart.toBase64Image("image/jpeg", 1.0);
      const link = document.createElement("a");
      link.href = url;
      link.download = "KineretHeightChemScatter.jpg";
      link.click();
    } else {
      alert("Chart image download not supported in this browser.");
    }
  };
  // Filter valid points
  const valid = (v) => typeof v === "number" && isFinite(v);
  const filtered = (dataArr || []).filter(
    (d) => valid(d.kineret_height) && (valid(d.avg_nitrate) || valid(d.avg_nitrit) || valid(d.chl_ug_l_avg))
  );

  // Toggle state for each field
  const [showNitrate, setShowNitrate] = React.useState(true);
  const [showNitrite, setShowNitrite] = React.useState(true);
  const [showChl, setShowChl] = React.useState(true);

  // Prepare datasets for each chemical, only include if toggled
  const scatterDatasets = [];
  if (showNitrate) {
    scatterDatasets.push({
      label: "Nitrate (mg/L)",
      data: filtered.map((d) => ({ x: d.kineret_height, y: d.avg_nitrate })),
      backgroundColor: "rgba(59,130,246,0.7)",
      borderColor: "rgba(59,130,246,1)",
      pointRadius: 6,
    });
  }
  if (showNitrite) {
    scatterDatasets.push({
      label: "Nitrite (mg/L)",
      data: filtered.map((d) => ({ x: d.kineret_height, y: d.avg_nitrit })),
      backgroundColor: "rgba(251,191,36,0.7)",
      borderColor: "rgba(251,191,36,1)",
      pointRadius: 6,
    });
  }
  if (showChl) {
    scatterDatasets.push({
      label: "Chlorophyll-a (µg/L)",
      data: filtered.map((d) => ({ x: d.kineret_height, y: d.chl_ug_l_avg })),
      backgroundColor: "rgba(34,197,94,0.7)",
      borderColor: "rgba(34,197,94,1)",
      pointRadius: 6,
    });
  }

  const chartData = {
    datasets: scatterDatasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, weight: "bold" } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `Height: ${ctx.parsed.x}, Value: ${ctx.parsed.y}`,
        },
      },
      title: {
        display: true,
        text: "Kineret Water Level vs Chemical Concentrations",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Kineret Water Level (m)",
          font: { size: 16, weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        title: {
          display: true,
          text: "Concentration",
          font: { size: 16, weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showNitrate} onChange={() => setShowNitrate((v) => !v)} />
          Nitrate
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showNitrite} onChange={() => setShowNitrite((v) => !v)} />
          Nitrite
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showChl} onChange={() => setShowChl((v) => !v)} />
          Chlorophyll-a
        </label>
      </div>
      <Scatter ref={chartRef} data={chartData} options={chartOptions} />
      <div className="mt-2 mb-4">
        <button
          className="mt-2 mb-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-sm flex items-center"
          onClick={() => {
            const chartInstance = chartRef.current?.chartInstance || chartRef.current?.instance || chartRef.current;
            if (chartInstance && chartInstance.toBase64Image) {
              const link = document.createElement('a');
              link.href = chartInstance.toBase64Image('image/jpeg', 1.0);
              link.download = `KineretHeightChemScatter.jpg`;
              link.click();
            } else {
              alert('Chart image download not supported in this browser.');
            }
          }}
        >
          Download
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
          </svg>
        </button>
      </div>
      <div className="mt-4 text-gray-700 text-sm">
        Toggle each chemical to show/hide its scatter graph.
      </div>
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-gray-800 text-base">
        <strong>Conclusion:</strong><br />
        <ul className="list-disc ml-6">
          <li>Nitrate and Nitrite concentrations are generally low and do not show a clear trend with water level.</li>
          <li>Chlorophyll-a concentrations are higher and may show some increase with rising water level, but further statistical analysis is recommended.</li>
          <li>Overall, there is no strong or linear relationship between Kineret water level and Nitrate/Nitrite concentrations. Chlorophyll-a may have a weak correlation.</li>
        </ul>
      </div>
    </div>
  );
};

export default KineretHeightChemScatter;
