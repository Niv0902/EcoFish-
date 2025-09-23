import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
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

// Example props: chartData.beaches = [{ beach, average }]
const EcoliBeachLineChart = ({ beaches }) => {
  if (!beaches || beaches.length === 0) {
    return <div className="text-center text-gray-500">No E.coli data available</div>;
  }

  // Sort beaches by average E.coli descending
  const sorted = [...beaches].sort((a, b) => b.average - a.average);
  const labels = sorted.map(b => {
    // Add visual indicators for stations
    if (b.beach && b.beach.toLowerCase().includes('station')) {
      return `🔴 ${b.beach}`; // Add red dot emoji
    }
    return b.beach;
  });
  const dataPoints = sorted.map(b => b.average);

  const data = {
    labels,
    datasets: [
      {
        label: 'E.coli (CFU/100mL)',
        data: dataPoints,
        borderColor: 'rgba(239,68,68,1)',
        backgroundColor: 'rgba(239,68,68,0.2)',
        fill: true,
        tension: 0.5,
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'E.coli Levels by Beach',
        font: { size: 18 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.y} CFU/100mL`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Beach' },
        grid: { color: 'rgba(59,130,246,0.1)' }
      },
      y: {
        title: { display: true, text: 'E.coli (CFU/100mL)' },
        grid: { color: 'rgba(239,68,68,0.1)' }
      }
    }
  };

  const chartRef = React.useRef(null);
  
  // Add cleanup effect and chart ID to prevent canvas reuse issues
  React.useEffect(() => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch (error) {
          console.log('Chart cleanup error:', error);
        }
      }
    };
  }, []);

  // Generate unique key to force chart recreation when data changes
  const chartKey = React.useMemo(() => {
    return `chart-${beaches?.length || 0}-${Date.now()}`;
  }, [beaches]);

  const handleDownload = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image('image/jpeg', 1);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EcoliBeachLineChart.jpg`;
      link.click();
    }
  };

  return (
    <div className="w-full">
      <Line key={chartKey} ref={chartRef} data={data} options={options} />
      <div className="flex justify-start mt-4">
        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors"
        >
          Download 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
          </svg>
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-left">
        This line chart shows average E.coli levels for each beach, with colored area for visual emphasis.
        In pelagic (offshore) stations, bacterial levels are much lower compared to coastal stations.
      </div>
    </div>
  );
};

export default EcoliBeachLineChart;