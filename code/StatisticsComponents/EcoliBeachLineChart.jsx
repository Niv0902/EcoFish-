import React from 'react';
import { Line } from 'react-chartjs-2';

// Example props: chartData.beaches = [{ beach, average }]
const EcoliBeachLineChart = ({ beaches }) => {
  if (!beaches || beaches.length === 0) {
    return <div className="text-center text-gray-500">No E.coli data available</div>;
  }

  // Sort beaches by average E.coli descending
  const sorted = [...beaches].sort((a, b) => b.average - a.average);
  const labels = sorted.map(b => b.beach);
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
      <Line ref={chartRef} data={data} options={options} />
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
      <div className="mt-4 text-sm text-gray-600 text-center">
        This line chart shows average E.coli levels for each beach, with colored area for visual emphasis.
      </div>
    </div>
  );
};

export default EcoliBeachLineChart;
