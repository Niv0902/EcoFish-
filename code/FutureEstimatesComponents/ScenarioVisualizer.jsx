import React, { useState, useMemo, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Droplets, Leaf, Eye, EyeOff } from 'lucide-react';

const ScenarioVisualizer = ({ data }) => {
  const [scenario, setScenario] = useState('baseline');
  const [gridSize, setGridSize] = useState(30);
  const [weights, setWeights] = useState({
    chloride: 0.20,
    nitrate: 0.15,
    heavy_metals: 0.28,
    ecoli: 0.12,
    flood: 0.12,
    depth: 0.05,
    water_level: 0.08
  });
  
  // New cool features
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(2000);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showContours, setShowContours] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [timeStep, setTimeStep] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  const extent = [-10, 10, -7, 7];

  // Animation effect for scenario transitions
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setTimeStep(prev => (prev + 1) % 100);
      }, animationSpeed);
      return () => clearInterval(interval);
    }
  }, [isAnimating, animationSpeed]);

  // Auto-cycle through scenarios in animation mode
  useEffect(() => {
    if (isAnimating && scenario !== 'combined') {
      const scenarios = ['baseline', 'stress', 'recovery'];
      const interval = setInterval(() => {
        setScenario(prev => {
          const currentIndex = scenarios.indexOf(prev);
          return scenarios[(currentIndex + 1) % scenarios.length];
        });
      }, animationSpeed * 3);
      return () => clearInterval(interval);
    }
  }, [isAnimating, scenario, animationSpeed]);

  // Extract statistics from Firebase data with enhanced processing
  const dataStats = useMemo(() => {
    if (!data) return {};
    
    const stats = {};
    
    // Extract from Chemicals_Height
    if (data.Chemicals_Height) {
      const chemValues = [];
      const nitrateValues = [];
      const heightValues = [];
      
      Object.values(data.Chemicals_Height).forEach(yearData => {
        if (Array.isArray(yearData)) {
          yearData.forEach(monthData => {
            if (monthData && typeof monthData === 'object') {
              Object.values(monthData).forEach(dayData => {
                if (Array.isArray(dayData)) {
                  dayData.forEach(measure => {
                    if (measure && typeof measure === 'object') {
                      if (measure.chl_ug_l_avg) chemValues.push(measure.chl_ug_l_avg);
                      if (measure.avg_nitrate) nitrateValues.push(measure.avg_nitrate);
                      if (measure.kineret_height) heightValues.push(measure.kineret_height);
                    }
                  });
                }
              });
            }
          });
        }
      });
      
      if (chemValues.length) stats.Chloride_mean = chemValues.reduce((a, b) => a + b) / chemValues.length;
      if (nitrateValues.length) stats.Nitrate_mean = nitrateValues.reduce((a, b) => a + b) / nitrateValues.length;
      else stats.Nitrate_mean = 8.0;
      if (heightValues.length) stats.Height_mean = heightValues.reduce((a, b) => a + b) / heightValues.length;
    }
    
    return stats;
  }, [data]);

  // Advanced pollution calculation with time dynamics and flow effects
  const calculatePollution = (X, Y, depthGradient, scenarioType) => {
    let pollutionIndex = 0;
    
    // Add temporal dynamics for animation
    const timeFactor = isAnimating ? Math.sin(timeStep * 0.1) * 0.3 + 1 : 1;
    
    // Wind and current effects (simulated)
    const windEffect = Math.sin(X * 0.5 + timeStep * 0.05) * Math.cos(Y * 0.3 + timeStep * 0.03) * 0.2;
    const currentFlow = {
      x: Math.sin(Y * 0.4 + timeStep * 0.02) * 0.3,
      y: Math.cos(X * 0.3 + timeStep * 0.04) * 0.2
    };
    
    if (scenarioType === 'baseline') {
      // Water level effect - simulates concentration/dilution
      const waterLevelEffect = 1.0 + 0.3 * Math.sin(X/3) * Math.cos(Y/4);
      
      // BASELINE - Moderate levels with clear spatial patterns
      let chemicalContrib = 0.40 + 0.30 * Math.exp(-((X*X) + Math.pow(Y-3, 2)) / 12);
      let nitrateContrib = 0.35 + 0.40 * Math.exp(-(Math.pow(X-4, 2) + Math.pow(Y+2, 2)) / 10);
      
      const distanceFromCenter = Math.sqrt(X*X + Y*Y);
      let metalContrib = 0.30 + 0.35 * Math.exp(-distanceFromCenter/6);
      
      // Depth significantly affects metal and chemical concentration
      const depthMultiplier = 1 + 1.5 * (depthGradient / 45);
      metalContrib *= depthMultiplier;
      chemicalContrib *= (1 + 0.8 * (depthGradient / 45));
      
      // Water level affects dilution of all pollutants
      chemicalContrib *= waterLevelEffect;
      nitrateContrib *= waterLevelEffect;
      metalContrib *= waterLevelEffect;
      
      const ecoliContrib = 0.20 + 0.25 * Math.exp(-(Math.pow(X+5, 2) + Y*Y) / 15);
      const floodContrib = 0.15 + 0.20 * Math.exp(-(X*X + Math.pow(Y-5, 2)) / 20);
      
      pollutionIndex = (
        chemicalContrib * weights.chloride +
        nitrateContrib * weights.nitrate +
        metalContrib * weights.heavy_metals +
        ecoliContrib * weights.ecoli +
        floodContrib * weights.flood +
        (depthGradient/45) * weights.depth * 3.0 +
        (waterLevelEffect - 1) * weights.water_level * 4.0
      ) * timeFactor * (1 + windEffect);
    } else if (scenarioType === 'stress') {
      // STRESS - DRAMATICALLY HIGH levels (8-10x baseline) with widespread contamination
      const distanceFromCenter = Math.sqrt(X*X + Y*Y);
      
      // Extreme drought - very low water level concentrates pollution severely
      const droughtWaterLevel = 0.3 + 0.2 * Math.sin(X/2) * Math.cos(Y/3);
      
      let chemicalContrib = 2.50 + 1.80 * Math.exp(-(X*X + Y*Y) / 8);
      chemicalContrib += 1.20 * Math.exp(-((X-2)*(X-2) + (Y+4)*(Y+4)) / 6);
      
      let nitrateContrib = 3.00 + 2.20 * Math.exp(-(Math.pow(X-4, 2) + Math.pow(Y+2, 2)) / 5);
      nitrateContrib += 1.80 * Math.exp(-(Math.pow(X+3, 2) + Math.pow(Y-1, 2)) / 7);
      nitrateContrib += 1.40 * Math.exp(-(Math.pow(X-6, 2) + Math.pow(Y+3, 2)) / 9);
      
      let metalContrib = 2.80 + 2.00 * Math.exp(-distanceFromCenter/4);
      metalContrib += 1.60 * Math.exp(-(Math.pow(X-5, 2) + Y*Y) / 6);
      metalContrib += 1.40 * Math.exp(-(Math.pow(X+5, 2) + Y*Y) / 6);
      metalContrib += 1.20 * Math.exp(-(X*X + Math.pow(Y+4, 2)) / 8);
      
      // Extreme depth concentration in drought - deeper areas become toxic pools
      const extremeDepthMultiplier = 1 + 3.5 * (depthGradient / 45);
      metalContrib *= extremeDepthMultiplier;
      chemicalContrib *= (1 + 2.8 * (depthGradient / 45));
      nitrateContrib *= (1 + 2.2 * (depthGradient / 45));
      
      // Severe drought concentration - low water level = extreme concentration
      const droughtConcentration = 1 / droughtWaterLevel;
      chemicalContrib *= droughtConcentration;
      nitrateContrib *= droughtConcentration;
      metalContrib *= droughtConcentration;
      
      let ecoliContrib = 1.60 + 1.40 * Math.exp(-(Math.pow(X+5, 2) + Y*Y) / 8);
      ecoliContrib += 1.00 * Math.exp(-(Math.pow(X-3, 2) + Math.pow(Y-4, 2)) / 10);
      ecoliContrib *= droughtConcentration * 0.8;
      
      const floodContrib = 1.80 + 1.60 * Math.exp(-(X*X + Math.pow(Y-5, 2)) / 12);
      
      pollutionIndex = (
        chemicalContrib * weights.chloride +
        nitrateContrib * weights.nitrate +
        metalContrib * weights.heavy_metals +
        ecoliContrib * weights.ecoli +
        floodContrib * weights.flood +
        (depthGradient/45) * weights.depth * 6.0 +
        (droughtConcentration - 1) * weights.water_level * 8.0
      ) * timeFactor * (1 + windEffect * 2); // Stress amplifies wind effects
    } else if (scenarioType === 'recovery') {
      // RECOVERY - Enhanced visibility with stronger treatment patterns
      
      // High water level for recovery - enhanced dilution
      const recoveryWaterLevel = 1.8 + 0.4 * Math.sin(X/4) * Math.cos(Y/5);
      
      // BASE RECOVERY LEVELS - Higher for better visibility
      let chemicalContrib = 0.25 + 0.15 * Math.exp(-(X*X + Y*Y) / 25);
      let nitrateContrib = 0.20 + 0.12 * Math.exp(-(Math.pow(X-4, 2) + Math.pow(Y+2, 2)) / 20);
      
      // ACTIVE TREATMENT ZONES - More prominent visual effect
      const treatmentZones = [
        [4, -2], [-2, 1], [1, 3], [0, 0], [-4, 3], [5, -1], 
        [-1, -2], [2, 4], [-3, -1], [3, 1]  // Added more zones
      ];
      treatmentZones.forEach(([cx, cy]) => {
        const treatmentStrength = 0.25 * Math.exp(-((X - cx)*(X - cx) + (Y - cy)*(Y - cy)) / 4);
        nitrateContrib -= treatmentStrength;
        chemicalContrib -= treatmentStrength * 0.8;
      });
      nitrateContrib = Math.max(0.05, Math.min(0.35, nitrateContrib));
      
      // CLEANUP ZONES - More visible metal treatment areas
      let metalContrib = 0.30;
      const cleanupZones = [
        [0, 4], [-3, 0], [3, -2], [0, 0], [-2, -3], [4, 2], [-5, 1],
        [1, -4], [-4, 2], [5, 0], [-2, 4], [2, -1]  // Added more cleanup zones
      ];
      cleanupZones.forEach(([cx, cy]) => {
        const cleanupStrength = 0.35 * Math.exp(-((X - cx)*(X - cx) + (Y - cy)*(Y - cy)) / 3);
        metalContrib -= cleanupStrength;
      });
      metalContrib = Math.max(0.08, Math.min(0.45, metalContrib));
      
      // RESTORATION PATTERNS - Visible depth and water effects
      const recoveryDepthMultiplier = 1 + 0.3 * (depthGradient / 45);
      metalContrib *= recoveryDepthMultiplier;
      chemicalContrib *= (1 + 0.2 * (depthGradient / 45));
      
      // Enhanced dilution effect that's still visible
      const dilutionEffect = 1.2 / recoveryWaterLevel;
      chemicalContrib *= dilutionEffect;
      nitrateContrib *= dilutionEffect;
      metalContrib *= dilutionEffect;
      
      // E.coli recovery with spatial patterns
      const ecoliContrib = (0.12 + 0.08 * Math.exp(-(Math.pow(X+5, 2) + Y*Y) / 30)) * dilutionEffect;
      const floodContrib = 0.08 + 0.05 * Math.exp(-(X*X + Math.pow(Y-5, 2)) / 35);
      
      // Enhanced base factor for visibility
      const recoveryBaseFactor = 1.8;  // Increased from 0.6 for better visibility
      
      pollutionIndex = recoveryBaseFactor * (
        chemicalContrib * weights.chloride +
        nitrateContrib * weights.nitrate +
        metalContrib * weights.heavy_metals +
        ecoliContrib * weights.ecoli +
        floodContrib * weights.flood +
        (depthGradient/45) * weights.depth * 3.0 +
        (2.5 - recoveryWaterLevel) * weights.water_level * 4.0
      ) * timeFactor * (1 - Math.abs(windEffect) * 0.3); // Recovery reduces wind effects
    }
    
    return pollutionIndex;
  };

  // Create integrated grid (similar to Python create_integrated_grid)
  const createGrid = useMemo(() => {
    const x = Array.from({ length: gridSize }, (_, i) => 
      extent[0] + (extent[1] - extent[0]) * i / (gridSize - 1)
    );
    const y = Array.from({ length: gridSize }, (_, i) => 
      extent[2] + (extent[3] - extent[2]) * i / (gridSize - 1)
    );
    
    const grid = [];
    const combinedGrid = scenario === 'combined' ? { baseline: [], stress: [], recovery: [] } : null;
    
    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      if (combinedGrid) {
        combinedGrid.baseline[i] = [];
        combinedGrid.stress[i] = [];
        combinedGrid.recovery[i] = [];
      }
      
      for (let j = 0; j < gridSize; j++) {
        const X = x[j];
        const Y = y[i];
        
        // Lake mask (elliptical shape)
        const lakeMask = (Math.pow(X/10, 2) + Math.pow(Y/6, 2)) < 1;
        if (!lakeMask) {
          grid[i][j] = null;
          if (combinedGrid) {
            combinedGrid.baseline[i][j] = null;
            combinedGrid.stress[i][j] = null;
            combinedGrid.recovery[i][j] = null;
          }
          continue;
        }
        
        // Depth gradient - deeper areas concentrate pollution more
        const depthGradient = Math.max(5, 45 * (1 - Math.sqrt(Math.pow(X/10, 2) + Math.pow(Y/6, 2))));
        
        if (scenario === 'combined') {
          // Calculate all three scenarios
          combinedGrid.baseline[i][j] = calculatePollution(X, Y, depthGradient, 'baseline');
          combinedGrid.stress[i][j] = calculatePollution(X, Y, depthGradient, 'stress');
          combinedGrid.recovery[i][j] = calculatePollution(X, Y, depthGradient, 'recovery');
          grid[i][j] = { 
            baseline: combinedGrid.baseline[i][j], 
            stress: combinedGrid.stress[i][j], 
            recovery: combinedGrid.recovery[i][j] 
          };
        } else {
          grid[i][j] = calculatePollution(X, Y, depthGradient, scenario);
        }
      }
    }
    
    return { x, y, grid, combinedGrid };
  }, [scenario, weights, gridSize]);

  // Enhanced color calculation with multiple visualization modes
  const getColor = (value, i, j) => {
    if (value === null || value === undefined) return 'transparent';
    
    // Heat map intensity calculation
    const heatIntensity = showHeatmap ? 1 : 0.3;
    
    if (scenario === 'combined') {
      // For combined view, create a gradient showing all three scenarios
      if (typeof value === 'object' && value !== null) {
        const { baseline, stress, recovery } = value;
        
        // Normalize values with updated recovery scale
        const normalizedBaseline = Math.min(1, baseline / 1.0);
        const normalizedStress = Math.min(1, stress / 8.0);
        const normalizedRecovery = Math.min(1, recovery / 1.2);  // Updated to match new recovery scale
        
        // Create RGB mixture: Red (stress), Blue (baseline), Green (recovery)
        const red = Math.min(255, 50 + normalizedStress * 150 + normalizedBaseline * 50);
        const green = Math.min(255, 50 + normalizedRecovery * 150 + normalizedBaseline * 50);
        const blue = Math.min(255, 50 + normalizedBaseline * 150 + normalizedRecovery * 50);
        
        const alpha = (0.3 + Math.max(normalizedBaseline, normalizedStress, normalizedRecovery) * 0.7) * heatIntensity;
        
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }
      return 'rgba(100, 100, 100, 0.5)';
    }
    
    if (scenario === 'baseline') {
      const intensity = Math.min(1, value / 1.0);
      const alpha = (0.2 + intensity * 0.8) * heatIntensity;
      const shimmer = isAnimating ? Math.sin(timeStep * 0.2 + i * 0.1 + j * 0.1) * 0.1 : 0;
      return `rgba(${59 + shimmer * 50}, ${130 + shimmer * 30}, ${246 + shimmer * 9}, ${alpha})`;
    } else if (scenario === 'stress') {
      const intensity = Math.min(1, value / 8.0);
      const alpha = (0.4 + intensity * 0.6) * heatIntensity;
      const flicker = isAnimating ? Math.sin(timeStep * 0.3 + i * 0.2 + j * 0.15) * 0.2 : 0;
      const red = Math.min(255, 180 + intensity * 75 + flicker * 75);
      const green = Math.max(0, 100 - intensity * 100 - flicker * 50);
      const blue = Math.max(0, 50 - intensity * 50 - flicker * 25);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    } else if (scenario === 'recovery') {
      // Enhanced visibility for recovery scenario
      const intensity = Math.min(1, value / 1.2);  // Adjusted scale for better visibility
      const baseAlpha = 0.5 + intensity * 0.5;  // Higher base alpha for visibility
      const alpha = baseAlpha * heatIntensity;
      
      // Enhanced pulse effect for better visibility
      const pulse = isAnimating ? Math.sin(timeStep * 0.15 + i * 0.05 + j * 0.08) * 0.25 : 0;
      
      // More vibrant green color scheme for recovery
      const red = Math.max(30, 150 - intensity * 120 - pulse * 30);    // Reduced red component
      const green = Math.min(255, 180 + intensity * 75 + pulse * 40);  // Enhanced green
      const blue = Math.max(60, 140 - intensity * 80 + pulse * 30);    // Balanced blue
      
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    return 'rgba(100, 100, 100, 0.5)';
  };

  const handleWeightChange = (param, value) => {
    const newValue = parseFloat(value);
    setWeights(prev => {
      const otherWeights = Object.entries(prev)
        .filter(([key]) => key !== param)
        .reduce((sum, [, val]) => sum + val, 0);
      
      // Ensure the new value doesn't make total exceed 1.0
      const maxAllowed = Math.min(1.0, 1.0 - otherWeights);
      const constrainedValue = Math.min(newValue, maxAllowed);
      
      return { ...prev, [param]: constrainedValue };
    });
  };

  const resetWeights = () => {
    setWeights({
      chloride: 0.20,
      nitrate: 0.15,
      heavy_metals: 0.28,
      ecoli: 0.12,
      flood: 0.12,
      depth: 0.05,
      water_level: 0.08
    });
  };

  const getScenarioIcon = (s) => {
    switch(s) {
      case 'baseline': return <Droplets className="w-4 h-4" />;
      case 'stress': return <Zap className="w-4 h-4" />;
      case 'recovery': return <Leaf className="w-4 h-4" />;
      case 'combined': return <Eye className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="mt-4 space-y-6">
      {/* Enhanced Control Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl shadow-lg">
        {/* Scenario Toggle with Icons */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-gray-800">Environmental Scenario Simulator 🌊</h3>
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {['baseline', 'stress', 'recovery', 'combined'].map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 ${
                  scenario === s
                    ? s === 'baseline' ? 'bg-blue-600 text-white shadow-lg' :
                      s === 'stress' ? 'bg-red-600 text-white shadow-lg' : 
                      s === 'recovery' ? 'bg-green-600 text-white shadow-lg' :
                      'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {getScenarioIcon(s)}
                {s === 'combined' ? 'Multi-View' : 
                 s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isAnimating ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAnimating ? 'Pause' : 'Animate'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Animation Speed:</label>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-xs">{animationSpeed}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Grid Size:</label>
            <input
              type="range"
              min="15"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-xs">{gridSize}x{gridSize}</span>
          </div>
        </div>

        {/* Visualization Options */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-lg border">
          <h4 className="text-sm font-bold text-gray-700">Visualization Options:</h4>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Heat Map Intensity</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Pollution Contours</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Comparison Mode</span>
          </label>
        </div>
      </div>

      {/* Enhanced Parameter Controls */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h4 className="text-lg font-bold mb-4 text-gray-800">Environmental Parameter Controls 🎛️</h4>
        {/* Total Weight Display */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Total Parameter Weight:</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${
                Object.values(weights).reduce((sum, val) => sum + val, 0) > 1.0 
                  ? 'text-red-600' 
                  : Object.values(weights).reduce((sum, val) => sum + val, 0) > 0.95 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
              }`}>
                {(Object.values(weights).reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">/ 100%</span>
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                Object.values(weights).reduce((sum, val) => sum + val, 0) > 1.0 
                  ? 'bg-red-500' 
                  : Object.values(weights).reduce((sum, val) => sum + val, 0) > 0.95 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, Object.values(weights).reduce((sum, val) => sum + val, 0) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(weights).map(([param, value]) => {
            const paramInfo = {
              chloride: { icon: '🧂', color: 'blue', desc: 'Salt concentration levels' },
              nitrate: { icon: '🌱', color: 'green', desc: 'Agricultural runoff indicator' },
              heavy_metals: { icon: '⚡', color: 'red', desc: 'Industrial pollution toxicity' },
              ecoli: { icon: '🦠', color: 'purple', desc: 'Bacterial contamination level' },
              flood: { icon: '🌊', color: 'cyan', desc: 'Flood event impact factor' },
              depth: { icon: '📏', color: 'indigo', desc: 'Water depth influence' },
              water_level: { icon: '💧', color: 'blue', desc: 'Lake water level effect' }
            };
            
            const info = paramInfo[param] || { icon: '📊', color: 'gray', desc: 'Parameter description' };
            
            return (
              <div key={param} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{info.icon}</span>
                  <label className="block font-medium capitalize text-gray-700">
                    {param.replace('_', ' ')}
                  </label>
                </div>
                <div className="mb-2">
                  <span className={`text-2xl font-bold text-${info.color}-600`}>
                    {value.toFixed(3)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">({(value * 100).toFixed(1)}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.001"
                  value={value}
                  onChange={(e) => handleWeightChange(param, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="mt-1 text-xs text-gray-400">
                  Max: {Math.min(1.0, 1.0 - Object.entries(weights).filter(([key]) => key !== param).reduce((sum, [, val]) => sum + val, 0)).toFixed(3)}
                </div>
                <p className="text-xs text-gray-500 mt-1">{info.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-View Legend */}
      {scenario === 'combined' && (
        <div className="bg-gradient-to-r from-blue-50 via-red-50 to-green-50 p-6 rounded-xl shadow-lg border">
          <h4 className="text-lg font-bold mb-4 text-gray-800">Multi-Scenario Color Legend 🎨</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-blue-700">Baseline Scenario</span>
                <p className="text-xs text-gray-600">Normal environmental conditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-red-700">Stress Scenario</span>
                <p className="text-xs text-gray-600">Extreme pollution & drought conditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <div>
                <span className="font-semibold text-green-700">Recovery Scenario</span>
                <p className="text-xs text-gray-600">Active treatment & restoration</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span className="text-sm"><strong>Purple Mix:</strong> Baseline + Stress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm"><strong>Yellow Mix:</strong> Baseline + Recovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm"><strong>Orange Mix:</strong> Stress + Recovery</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Grid Visualization */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-800">
            Lake Kinneret Pollution Simulation 🗺️
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Resolution: {gridSize}x{gridSize}</span>
            {isAnimating && (
              <span className="animate-pulse text-green-600 font-medium">● Live</span>
            )}
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl overflow-hidden border-4 border-blue-200" style={{ aspectRatio: '20/14' }}>
          <svg width="100%" height="100%" viewBox={`${extent[0]} ${extent[2]} ${extent[1] - extent[0]} ${extent[3] - extent[2]}`}>
            {/* Lake boundary */}
            <ellipse
              cx="0"
              cy="0"
              rx="10"
              ry="6"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="0.2"
              strokeDasharray="1,0.5"
            />
            
            {/* Pollution grid */}
            {createGrid.grid.map((row, i) => 
              row.map((value, j) => (
                <rect
                  key={`${i}-${j}`}
                  x={createGrid.x[j] - (createGrid.x[1] - createGrid.x[0]) / 2}
                  y={createGrid.y[i] - (createGrid.y[1] - createGrid.y[0]) / 2}
                  width={createGrid.x[1] - createGrid.x[0]}
                  height={createGrid.y[1] - createGrid.y[0]}
                  fill={getColor(value, i, j)}
                  stroke={showContours && value ? "rgba(0,0,0,0.1)" : "none"}
                  strokeWidth="0.05"
                  className="cursor-crosshair"
                  onClick={() => setSelectedPoint({ x: createGrid.x[j], y: createGrid.y[i], value, i, j })}
                />
              ))
            )}
            
            {/* Contour lines */}
            {showContours && (
              <g opacity="0.4">
                {/* Add contour line generation here for different pollution levels */}
                {[0.2, 0.5, 1.0, 2.0, 5.0].map((level, idx) => (
                  <circle
                    key={idx}
                    cx="0"
                    cy="0"
                    r={2 + level * 2}
                    fill="none"
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.1"
                    strokeDasharray="0.5,0.3"
                  />
                ))}
              </g>
            )}
            
            {/* Selected point indicator */}
            {selectedPoint && (
              <g>
                <circle
                  cx={selectedPoint.x}
                  cy={selectedPoint.y}
                  r="0.5"
                  fill="none"
                  stroke="black"
                  strokeWidth="0.2"
                  className="animate-ping"
                />
                <circle
                  cx={selectedPoint.x}
                  cy={selectedPoint.y}
                  r="0.3"
                  fill="black"
                  opacity="0.8"
                />
              </g>
            )}
            
            {/* Wind/Current flow indicators if enabled */}
            {showFlow && isAnimating && (
              <g opacity="0.6">
                {Array.from({length: 10}).map((_, idx) => {
                  const x = -8 + (idx % 5) * 4;
                  const y = -4 + Math.floor(idx / 5) * 4;
                  const flowX = Math.sin(y * 0.4 + timeStep * 0.02) * 0.8;
                  const flowY = Math.cos(x * 0.3 + timeStep * 0.04) * 0.6;
                  return (
                    <line
                      key={idx}
                      x1={x}
                      y1={y}
                      x2={x + flowX}
                      y2={y + flowY}
                      stroke="rgba(59, 130, 246, 0.8)"
                      strokeWidth="0.1"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="rgba(59, 130, 246, 0.8)" />
                  </marker>
                </defs>
              </g>
            )}
          </svg>
          
          {/* Overlay information */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
            <h5 className="font-semibold text-sm mb-1">Current Scenario</h5>
            <div className="flex items-center gap-2">
              {getScenarioIcon(scenario)}
              <span className="text-sm capitalize font-medium">{scenario}</span>
            </div>
            {isAnimating && (
              <div className="text-xs text-gray-600 mt-1">
                Frame: {timeStep}/100
              </div>
            )}
          </div>
        </div>
        
        {/* Selected Point Info */}
        {selectedPoint && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <h5 className="font-semibold mb-2">Selected Point Analysis 📍</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Coordinates:</span>
                <div className="font-mono">({selectedPoint.x.toFixed(1)}, {selectedPoint.y.toFixed(1)})</div>
              </div>
              <div>
                <span className="text-gray-600">Grid Position:</span>
                <div className="font-mono">[{selectedPoint.i}, {selectedPoint.j}]</div>
              </div>
              <div>
                <span className="text-gray-600">Pollution Index:</span>
                <div className="font-bold text-red-600">{typeof selectedPoint.value === 'object' ? 'Multi-level' : selectedPoint.value.toFixed(3)}</div>
              </div>
              <div>
                <span className="text-gray-600">Risk Level:</span>
                <div className={`font-medium ${
                  selectedPoint.value > 2 ? 'text-red-600' : 
                  selectedPoint.value > 1 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {selectedPoint.value > 2 ? 'HIGH' : selectedPoint.value > 1 ? 'MEDIUM' : 'LOW'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Scenario Analysis */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h4 className="text-lg font-bold mb-4 text-gray-800">Detailed Scenario Analysis 📊</h4>
        
        {scenario === 'baseline' && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-6 h-6 text-blue-600" />
              <h5 className="text-xl font-bold text-blue-800">Baseline Environmental Conditions</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <h6 className="font-semibold text-blue-700">Pollution Levels (Moderate Range)</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>E.coli 🦠:</span><span className="font-mono">0.20-0.45 CFU/100ml</span></div>
                  <div className="flex justify-between"><span>Chloride 🧂:</span><span className="font-mono">0.40-0.70 mg/L</span></div>
                  <div className="flex justify-between"><span>Nitrate 🌱:</span><span className="font-mono">0.35-0.75 mg/L</span></div>
                  <div className="flex justify-between"><span>Heavy Metals ⚡:</span><span className="font-mono">0.30-0.65 μg/L</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h6 className="font-semibold text-blue-700">Environmental Characteristics</h6>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✓ Stable water levels with seasonal variation</li>
                  <li>✓ Natural circulation patterns</li>
                  <li>✓ Moderate agricultural runoff</li>
                  <li>✓ Normal depth stratification</li>
                  <li>✓ Seasonal temperature cycles</li>
                </ul>
              </div>
            </div>
            <p className="text-blue-700 font-medium bg-blue-100 p-3 rounded-lg">
              <strong>Assessment:</strong> Normal environmental conditions with predictable spatial pollution patterns. 
              Ecosystem maintains natural balance with manageable human impact. 📈
            </p>
          </div>
        )}

        {scenario === 'stress' && (
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-red-600" />
              <h5 className="text-xl font-bold text-red-800">Extreme Environmental Stress</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <h6 className="font-semibold text-red-700">Critical Pollution Levels (8-24× Baseline)</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>E.coli 🦠:</span><span className="font-mono text-red-600">1.60-4.50 (×8-10)</span></div>
                  <div className="flex justify-between"><span>Chloride 🧂:</span><span className="font-mono text-red-600">2.50-9.90 (×6-14)</span></div>
                  <div className="flex justify-between"><span>Nitrate 🌱:</span><span className="font-mono text-red-600">3.00-14.50 (×8-19)</span></div>
                  <div className="flex justify-between"><span>Heavy Metals ⚡:</span><span className="font-mono text-red-600">2.80-15.80 (×9-24)</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h6 className="font-semibold text-red-700">Crisis Conditions</h6>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>🚨 Severe drought conditions (30% water level)</li>
                  <li>🔥 Extreme concentration effects</li>
                  <li>☠️ Multiple contamination sources active</li>
                  <li>🌪️ Enhanced wind mixing toxins</li>
                  <li>⚠️ Depth creates toxic accumulation zones</li>
                </ul>
              </div>
            </div>
            <p className="text-red-700 font-medium bg-red-100 p-3 rounded-lg">
              <strong>EMERGENCY STATUS:</strong> Ecosystem collapse scenario with extreme drought and massive contamination. 
              Immediate intervention required to prevent permanent damage. 🚨
            </p>
          </div>
        )}

        {scenario === 'recovery' && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-green-600" />
              <h5 className="text-xl font-bold text-green-800">Active Recovery & Restoration</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <h6 className="font-semibold text-green-700">Ultra-Low Pollution (15-20% of Baseline)</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>E.coli 🦠:</span><span className="font-mono text-green-600">0.12-0.25 (Enhanced Visibility)</span></div>
                  <div className="flex justify-between"><span>Chloride 🧂:</span><span className="font-mono text-green-600">0.25-0.40 (Treatment Zones)</span></div>
                  <div className="flex justify-between"><span>Nitrate 🌱:</span><span className="font-mono text-green-600">0.05-0.35 (Active Recovery)</span></div>
                  <div className="flex justify-between"><span>Heavy Metals ⚡:</span><span className="font-mono text-green-600">0.08-0.45 (Cleanup Patterns)</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h6 className="font-semibold text-green-700">Recovery Interventions</h6>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>🌊 High water levels (180% + variation)</li>
                  <li>🏭 6 active treatment zones operational</li>
                  <li>🧹 7 heavy metal cleanup sites</li>
                  <li>💨 Reduced wind dispersion effects</li>
                  <li>🔄 Enhanced natural circulation</li>
                </ul>
              </div>
            </div>
            <p className="text-green-700 font-medium bg-green-100 p-3 rounded-lg">
              <strong>RESTORATION SUCCESS:</strong> Intensive treatment and high water levels create optimal recovery conditions. 
              Ecosystem shows strong resilience with managed intervention. 🌿
            </p>
          </div>
        )}

        {scenario === 'combined' && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-6 h-6 text-purple-600" />
              <h5 className="text-xl font-bold text-purple-800">Multi-Scenario Comparative Analysis</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <h6 className="font-semibold text-blue-800">Baseline (Blue)</h6>
                </div>
                <p className="text-sm text-blue-700">Normal environmental conditions with moderate pollution levels and natural spatial patterns.</p>
                <div className="mt-2 text-xs text-blue-600">
                  <div>Range: 0.2-0.75 units</div>
                  <div>Status: Stable ecosystem</div>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  <h6 className="font-semibold text-red-800">Stress (Red)</h6>
                </div>
                <p className="text-sm text-red-700">Extreme drought + massive contamination creating ecosystem crisis conditions.</p>
                <div className="mt-2 text-xs text-red-600">
                  <div>Range: 1.6-15.8 units</div>
                  <div>Status: Emergency intervention needed</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <h6 className="font-semibold text-green-800">Recovery (Green)</h6>
                </div>
                <p className="text-sm text-green-700">Active treatment with high water levels creating optimal restoration conditions.</p>
                <div className="mt-2 text-xs text-green-600">
                  <div>Range: 0.01-0.2 units</div>
                  <div>Status: Successful rehabilitation</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h6 className="font-semibold mb-2">Comparative Insights 🔬</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Spatial Patterns:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Stress shows widespread contamination</li>
                    <li>• Recovery has targeted treatment zones</li>
                    <li>• Baseline maintains natural gradients</li>
                  </ul>
                </div>
                <div>
                  <strong>Parameter Sensitivity:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Heavy metals most variable (×24 range)</li>
                    <li>• Water level critical for all scenarios</li>
                    <li>• Depth amplifies pollution effects</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioVisualizer;