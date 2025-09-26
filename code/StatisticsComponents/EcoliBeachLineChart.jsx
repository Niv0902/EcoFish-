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
    if (b.beach && b.beach.toLowerCase().includes('station')) {
      return `🔴 ${b.beach}`;
    }
    return b.beach;
  });
  const dataPoints = sorted.map(b => b.average);

  // Color logic from heatmap
  const maxEcoli = Math.max(...sorted.map(b => b.average));
  const minEcoli = Math.min(...sorted.map(b => b.average));
  const beachColors = sorted.map(beach => {
    const normalizedValue = maxEcoli === minEcoli ? 0 : (beach.average - minEcoli) / (maxEcoli - minEcoli);
    if (normalizedValue < 0.33) {
      return `rgba(34, 197, 94, 1)`; // Green
    } else if (normalizedValue < 0.66) {
      return `rgba(251, 191, 36, 1)`; // Yellow
    } else {
      return `rgba(239, 68, 68, 1)`; // Red
    }
  });

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
        pointRadius: 6,
        pointBackgroundColor: beachColors,
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
    title: {
      display: true,
      text: 'Beach',
      font: { weight: 'bold' }
    },
    grid: { color: 'rgba(59,130,246,0.1)' }
  },
  y: {
    title: {
      display: true,
      text: 'E.coli (CFU/100mL)',
      font: { weight: 'bold' }
    },
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
      <div style={{height: '480px'}}>
        <Line key={chartKey} ref={chartRef} data={data} options={options} />
      </div>
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
      {/* English explanation for legend */}
      <div className="text-center text-sm text-gray-700 mt-6 mb-2">
        <b>Legend explanation:</b> Each dot in the chart represents a beach, and its color indicates the E.coli risk level:
        <br/>
        Green = Low risk (safe water)
        <br/>
        Yellow = Medium risk (caution)
        <br/>
        Red = High risk (contaminated water)
      </div>
      <div className="mt-4 text-sm text-gray-600 text-left">
        This line chart shows average E.coli levels for each beach, with colored area for visual emphasis.
        In pelagic (offshore) stations, bacterial levels are much lower compared to coastal stations.
      </div>
    </div>
  );
};

export default EcoliBeachLineChart;