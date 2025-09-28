import React, { useState, useRef, useEffect } from 'react';
import { TrendingDown, AlertTriangle, Filter, Eye, EyeOff } from 'lucide-react';

// Timeline data
const timelineData = [
  { year: 2010, clean: 83.4, critical: 0.3, dominant_pollutants: ['Low E.coli', 'Minimal heavy metals'], severity: 'Low', severityValue: 1 },
  { year: 2011, clean: 83.2, critical: 0.3, dominant_pollutants: ['Stable chloride', 'Low flood risk'], severity: 'Low', severityValue: 1 },
  { year: 2012, clean: 82.8, critical: 0.4, dominant_pollutants: ['Increasing bacteria', 'Zn detection'], severity: 'Low-Moderate', severityValue: 2 },
  { year: 2013, clean: 79.9, critical: 0.7, dominant_pollutants: ['E.coli spikes', 'Zn, Pb increase'], severity: 'Moderate', severityValue: 3 },
  { year: 2014, clean: 78.8, critical: 0.9, dominant_pollutants: ['Chloride rise', 'Heavy metal accumulation'], severity: 'Moderate', severityValue: 3 },
  { year: 2015, clean: 78.1, critical: 1.0, dominant_pollutants: ['Flood events', 'Pb detection'], severity: 'Moderate-High', severityValue: 4 },
  { year: 2016, clean: 77.5, critical: 1.2, dominant_pollutants: ['Agricultural runoff', 'Zn increase'], severity: 'Moderate-High', severityValue: 4 },
  { year: 2017, clean: 76.4, critical: 1.9, dominant_pollutants: ['High E.coli', 'Multiple contaminants'], severity: 'High', severityValue: 5 },
  { year: 2018, clean: 74.9, critical: 1.8, dominant_pollutants: ['Complex pollution', 'Pb spike'], severity: 'High', severityValue: 5 },
  { year: 2019, clean: 74.1, critical: 2.3, dominant_pollutants: ['Peak contamination', 'System stress'], severity: 'Very High', severityValue: 6 },
  { year: 2020, clean: 73.3, critical: 2.7, dominant_pollutants: ['Pandemic impacts', 'Reduced monitoring'], severity: 'Critical', severityValue: 7 },
  { year: 2021, clean: 72.7, critical: 2.7, dominant_pollutants: ['Persistent contamination', 'Recovery start'], severity: 'Critical', severityValue: 7 },
  { year: 2022, clean: 71.8, critical: 2.6, dominant_pollutants: ['Improvement efforts', 'Stabilization'], severity: 'High-Critical', severityValue: 6 },
  { year: 2023, clean: 69.7, critical: 2.5, dominant_pollutants: ['Recovery programs', 'Ongoing challenges'], severity: 'High-Critical', severityValue: 6 }
];

const YearlyAnalysis = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('clean');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [yearRange, setYearRange] = useState([2010, 2023]);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const svgRef = useRef(null);

  const metrics = {
    clean: { label: 'Clean Areas %', color: '#10b981', key: 'clean' },
    critical: { label: 'Critical Areas %', color: '#ef4444', key: 'critical' },
    severity: { label: 'Severity Level', color: '#f59e0b', key: 'severityValue' }
  };

  const severities = ['all', 'Low', 'Moderate', 'High', 'Critical'];

  // Filter data based on current filters
  const filteredData = timelineData.filter(item => {
    const yearInRange = item.year >= yearRange[0] && item.year <= yearRange[1];
    const severityMatch = severityFilter === 'all' || 
      (severityFilter === 'Low' && item.severityValue <= 2) ||
      (severityFilter === 'Moderate' && item.severityValue >= 3 && item.severityValue <= 4) ||
      (severityFilter === 'High' && item.severityValue >= 5 && item.severityValue <= 6) ||
      (severityFilter === 'Critical' && item.severityValue >= 7);
    
    return yearInRange && severityMatch;
  });

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return '#ef4444';
    if (severity === 'Very High' || severity === 'High-Critical') return '#f97316';
    if (severity === 'High') return '#f59e0b';
    if (severity.includes('Moderate')) return '#3b82f6';
    return '#10b981';
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'Critical') return 'bg-red-200 text-red-800';
    if (severity === 'Very High' || severity === 'High-Critical') return 'bg-orange-200 text-orange-800';
    if (severity === 'High') return 'bg-yellow-200 text-yellow-800';
    if (severity.includes('Moderate')) return 'bg-blue-200 text-blue-800';
    return 'bg-green-200 text-green-800';
  };

  // Calculate chart dimensions and scales
  const chartWidth = 800;
  const chartHeight = 300;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const xScale = (year) => ((year - 2010) / 13) * innerWidth;
  const yScale = (value) => {
    const maxValue = selectedMetric === 'severity' ? 7 : 
                   selectedMetric === 'critical' ? Math.max(...timelineData.map(d => d.critical)) : 
                   Math.max(...timelineData.map(d => d.clean));
    return innerHeight - (value / maxValue) * innerHeight;
  };

  // Generate trend line path
  const generateTrendLine = () => {
    if (filteredData.length < 2) return '';
    
    const pathData = filteredData.map((d, i) => {
      const x = xScale(d.year);
      const y = yScale(d[metrics[selectedMetric].key]);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  };

  const initialClean = timelineData[0].clean;
  const finalClean = timelineData[timelineData.length - 1].clean;
  const cleanDecline = initialClean - finalClean;
  const criticalIncrease = timelineData[timelineData.length - 1].critical - timelineData[0].critical;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Interactive Timeline Controls</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Metric Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metric</label>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.entries(metrics).map(([key, metric]) => (
                <option key={key} value={key}>{metric.label}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {severities.map(severity => (
                <option key={severity} value={severity}>
                  {severity === 'all' ? 'All Severities' : severity}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year Range</label>
            <div className="flex gap-1">
              <input 
                type="number" 
                min="2010" 
                max="2023" 
                value={yearRange[0]}
                onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <input 
                type="number" 
                min="2010" 
                max="2023" 
                value={yearRange[1]}
                onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Trend Line Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
            <button
              onClick={() => setShowTrendLine(!showTrendLine)}
              className={`w-full p-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                showTrendLine 
                  ? 'bg-purple-100 border-purple-300 text-purple-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}
            >
              {showTrendLine ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Trend Line
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {metrics[selectedMetric].label} Timeline
        </h3>
        
        <div className="relative">
          <svg
            ref={svgRef}
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto border border-gray-200 rounded-lg"
          >
            {/* Chart background */}
            <rect width={chartWidth} height={chartHeight} fill="#f9fafb" />
            
            {/* Chart area */}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <g key={ratio}>
                  <line
                    x1={0}
                    y1={innerHeight * ratio}
                    x2={innerWidth}
                    y2={innerHeight * ratio}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                </g>
              ))}
              
              {/* Year labels */}
              {filteredData.map(d => (
                <text
                  key={d.year}
                  x={xScale(d.year)}
                  y={innerHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {d.year}
                </text>
              ))}
              
              {/* Trend line */}
              {showTrendLine && filteredData.length > 1 && (
                <path
                  d={generateTrendLine()}
                  fill="none"
                  stroke={metrics[selectedMetric].color}
                  strokeWidth={2}
                  opacity={0.6}
                />
              )}
              
              {/* Data points */}
              {filteredData.map(d => (
                <circle
                  key={d.year}
                  cx={xScale(d.year)}
                  cy={yScale(d[metrics[selectedMetric].key])}
                  r={hoveredPoint === d.year ? 8 : 6}
                  fill={getSeverityColor(d.severity)}
                  stroke="white"
                  strokeWidth={2}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredPoint(d.year)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
            
            {/* Y-axis label */}
            <text
              transform={`translate(20, ${chartHeight/2}) rotate(-90)`}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              {metrics[selectedMetric].label}
            </text>
          </svg>
          
          {/* Hover tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
              {(() => {
                const data = filteredData.find(d => d.year === hoveredPoint);
                return data ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{data.year}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(data.severity)}`}>
                        {data.severity}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Clean: <span className="font-semibold text-green-600">{data.clean}%</span></div>
                      <div>Critical: <span className="font-semibold text-red-600">{data.critical}%</span></div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="font-medium text-gray-700 mb-1">Main Issues:</div>
                        {data.dominant_pollutants.map((pollutant, idx) => (
                          <div key={idx} className="text-xs text-gray-600">• {pollutant}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-bold text-gray-800">Summary Statistics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="font-semibold text-red-800">Clean Areas Decline:</p>
            <p className="text-red-700">
              {initialClean}% → {finalClean}% (-{cleanDecline.toFixed(1)} points)
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-800">Critical Areas Increase:</p>
            <p className="text-orange-700">
              {timelineData[0].critical}% → {timelineData[timelineData.length - 1].critical}% (+{criticalIncrease.toFixed(1)} points)
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">Data Points:</p>
            <p className="text-blue-700">
              {filteredData.length} years shown
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyAnalysis;