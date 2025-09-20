import React, { useState } from 'react';

const EcoliHeatmap = ({ chartData }) => {
  const [beachSearchQuery, setBeachSearchQuery] = useState('');

  // Filter beaches based on search query
  const filteredBeaches = chartData?.beaches
    ? chartData.beaches.filter(beach =>
        beach.beach.toLowerCase().includes(beachSearchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="h-full flex flex-col">
      {chartData?.beaches && chartData.beaches.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              E.coli Contamination Heatmap by Beach
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">🔍 Search:</span>
              <input
                type="text"
                placeholder="Filter beaches..."
                value={beachSearchQuery}
                onChange={e => setBeachSearchQuery(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                list="beach-list"
              />
              <datalist id="beach-list">
                {chartData.beaches.map((beach, idx) => (
                  <option key={idx} value={beach.beach} />
                ))}
              </datalist>
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
          <div className="flex-1 overflow-hidden">
            {filteredBeaches.length === 0 ? (
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
            ) : (
              <div className="h-full p-4 overflow-auto">
                <div
                  className="grid gap-4 w-full auto-rows-max"
                  style={{
                    gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
                    maxWidth: '100%',
                  }}
                >
                  {filteredBeaches.map((beach, index) => {
                    const maxEcoli = Math.max(...chartData.beaches.map(b => b.average));
                    const minEcoli = Math.min(...chartData.beaches.map(b => b.average));
                    const normalizedValue =
                      maxEcoli === minEcoli
                        ? 0
                        : (beach.average - minEcoli) / (maxEcoli - minEcoli);

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
                        className="rounded-lg p-3 border border-gray-200 cursor-pointer shadow-sm flex flex-col justify-center items-center min-h-[80px] aspect-square transition-all duration-500 hover:scale-110 hover:shadow-lg animate-heatmap-pop"
                        style={{ backgroundColor, animationDelay: `${index * 40}ms` }}
                        title={`${beach.beach}: ${beach.average.toFixed(0)} CFU/100mL - ${riskLevel}`}
                      >
                        <div className="text-center w-full h-full flex flex-col justify-center overflow-hidden">
                          <div
                            className="text-xs font-medium mb-1 leading-tight truncate px-1"
                            style={{ color: textColor }}
                          >
                            {beach.beach.length > 8
                              ? beach.beach.slice(0, 8) + '...'
                              : beach.beach}
                          </div>
                          <div className="text-sm font-bold mb-1" style={{ color: textColor }}>
                            {beach.average.toFixed(0)}
                          </div>
                          <div className="text-xs" style={{ color: textColor }}>
                            CFU/100mL
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Legend and Info */}
          <div className="mt-4 px-4 border-t pt-4 flex-shrink-0">
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
              {beachSearchQuery && ` | Showing ${filteredBeaches.length} of ${chartData.beaches.length} beaches`}
            </p>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No E.coli data available</p>
      )}
    </div>
  );
};

// Add keyframes for pop-in animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes heatmap-pop {
  0% { transform: scale(0.7); opacity: 0.2; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-heatmap-pop {
  animation: heatmap-pop 0.7s cubic-bezier(.4,0,.2,1);
}
`;
document.head.appendChild(style);

export default EcoliHeatmap;