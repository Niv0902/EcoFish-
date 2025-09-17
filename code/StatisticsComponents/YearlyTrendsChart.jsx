import React from 'react';
import { Line } from 'react-chartjs-2';

const YearlyTrendsChart = ({ chartData, hasAnimated }) => {
  return (
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
  );
};

export default YearlyTrendsChart;