import React, { useState, useEffect } from 'react';
import { Home, FileText, BarChart3, Image, Brain, Droplets, Waves, AlertTriangle, MapPin } from 'lucide-react';
import sunPhoto from './assets/sun.webp';

const Homepage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [contaminants, setContaminants] = useState([]);
  const [algaeBloom, setAlgaeBloom] = useState([]);
  const [currentFact, setCurrentFact] = useState(0);

  const kinneretFacts = [
    {
      title: "HEAVY METALS",
      value: "Data not recently available", 
      description: "Recent public monitoring hasn't published up-to-date figures for Hg, Pb etc. in surface water", 
      color: "from-red-500 to-orange-500"
    },
    {
      title: "CHEMICAL LEVELS", 
      value: "NO₃ / N many mg/L (season-dependent)",  
      description: "Nitrate concentrations fluctuate; lower in summer, higher after rains", 
      color: "from-green-500 to-yellow-500"
    },
    {
      title: "SALINITY / CHLORIDE",
      value: "Increasing trend of chloride", 
      description: "Salinity and chloride concentrations rising over time, contributing to water quality concerns", 
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "NUTRIENT CONTENT (PHOSPHORUS & NITROGEN)",
      value: "Seasonally variable P & N", 
      description: "Phosphorus partly from internal sources; nitrogen more from runoff; summer deficits in epilimnion", 
      color: "from-orange-500 to-red-500"
    },
    {
      title: "WATER TEMPERATURE / THERMAL STRATIFICATION",
      value: "High in summer (~30°C upper layers)", 
      description: "Lake stratifies; lower hypolimnion becomes anoxic; affects nutrient release", 
      color: "from-teal-500 to-green-500"
    }
  ];

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'from-blue-600 to-cyan-700' },
    { id: 'ecoreport', label: 'EcoReport', icon: FileText, color: 'from-green-600 to-emerald-700' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, color: 'from-red-600 to-orange-700' },
    { id: 'gallery', label: 'Gallery', icon: Image, color: 'from-purple-600 to-pink-700' },
    { id: 'rag', label: 'RAG', icon: Brain, color: 'from-indigo-600 to-purple-700' }
  ];

  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70 + 15,
      size: Math.random() * 25 + 8,
      speed: Math.random() * 4 + 1,
      opacity: Math.random() * 0.9 + 0.4,
      type: Math.random() > 0.3 ? 'chemical' : 'sewage'
    }));
    setContaminants(particles);

    const algae = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 60 + 20,
      size: Math.random() * 60 + 30,
      intensity: Math.random() * 0.9 + 0.5
    }));
    setAlgaeBloom(algae);

    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % kinneretFacts.length);
    }, 3000);

    return () => clearInterval(factInterval);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="relative min-h-[800px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-200/60 via-blue-200/50 to-teal-300/60 rounded-2xl">
              <div className="absolute bottom-0 left-0 right-0 h-32">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-300/50 to-transparent animate-pulse"></div>
                <Waves className="absolute bottom-4 left-4 w-8 h-8 text-cyan-600 animate-bounce" />
                <Waves className="absolute bottom-6 right-8 w-6 h-6 text-blue-600 animate-bounce" />
                <Waves className="absolute bottom-8 left-1/2 w-7 h-7 text-teal-600 animate-bounce" />
              </div>
              
              {contaminants.map((particle) => (
                <div
                  key={particle.id}
                  className={`absolute rounded-full animate-pulse ${
                    particle.type === 'chemical' 
                      ? 'bg-yellow-600/70' 
                      : 'bg-brown-600/60'
                  }`}
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    opacity: particle.opacity
                  }}
                ></div>
              ))}

              {algaeBloom.map((algae) => (
                <div
                  key={algae.id}
                  className="absolute rounded-full bg-green-500/40 animate-pulse"
                  style={{
                    left: `${algae.x}%`,
                    top: `${algae.y}%`,
                    width: `${algae.size}px`,
                    height: `${algae.size}px`,
                    opacity: algae.intensity,
                    filter: 'blur(2px)'
                  }}
                ></div>
              ))}

              <div className="absolute top-12 left-16 w-3 h-3 bg-cyan-300 rounded-full animate-bounce opacity-70"></div>
              <div className="absolute top-24 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-36 left-1/3 w-4 h-4 bg-teal-300 rounded-full animate-ping opacity-50"></div>
              <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-80"></div>
            </div>

            <div className="relative z-10 text-center py-20">
              <div>
                <div className="mb-8 relative">
                  <div className="flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-red-500 mr-3 animate-pulse" />
                    <span className="text-xl text-blue-800 font-black tracking-wider drop-shadow-lg">Sea of Galilee (Kinneret), Israel</span>
                  </div>
                  <h2 className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
                    Kinneret Pollution Report
                  </h2>
                  <div className="absolute -top-4 -right-16">
                    <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce" />
                  </div>
                </div>
                
                <p className="text-2xl text-gray-800 mb-12 max-w-4xl mx-auto leading-relaxed font-medium tracking-wide drop-shadow-sm">
                  Comprehensive environmental monitoring of Lake Kinneret including heavy metals analysis, chemical contamination tracking, and flood impact assessment with real-time data visualization
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-16 max-w-6xl mx-auto px-4">
                  <div className="col-span-1 md:col-span-2 group bg-red-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-500 border border-red-300/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 animate-pulse"></div>
                    <div className="relative">
                      <h3 className="text-xl font-black mb-4 text-red-800 flex items-center justify-center tracking-wide drop-shadow-md">Heavy Metals <Droplets className="w-6 h-6 text-red-600 animate-bounce ml-2" /></h3>
                      <p className="text-base text-red-700 font-semibold text-center tracking-wide">Critical contamination levels detected in lake water</p>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-3 group bg-green-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-500 border border-green-300/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-yellow-500/20 animate-pulse"></div>
                    <div className="relative">
                      <h3 className="text-xl font-black mb-4 text-green-800 flex items-center justify-center tracking-wide drop-shadow-md">Chemical Levels 
                        <div className="relative w-6 h-6 ml-2">
                          {/* Test tube icon */}
                          <div className="w-6 h-6 relative">
                            {/* Test tube body */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-gradient-to-t from-green-600 to-green-400 rounded-b-lg opacity-90"></div>
                            {/* Test tube liquid */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-t from-yellow-400 to-green-300 rounded-b-lg animate-pulse"></div>
                            {/* Test tube rim */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-400 rounded-t-sm"></div>
                            {/* Bubbles effect */}
                            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-80 animate-ping"></div>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 translate-x-1 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-pulse"></div>
                          </div>
                        </div>
                      </h3>
                      <p className="text-base text-green-700 font-semibold text-center tracking-wide">Nitrates and chemical runoff monitoring system with comprehensive analysis of water quality parameters including seasonal variations and environmental impact assessments</p>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 group bg-blue-100/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 border border-blue-300/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 animate-pulse"></div>
                    <div className="relative">
                      <h3 className="text-xl font-black mb-4 text-blue-800 flex items-center justify-center tracking-wide drop-shadow-md">Flood Impact <Waves className="w-6 h-6 text-blue-600 animate-bounce ml-2" /></h3>
                      <p className="text-base text-blue-700 font-semibold text-center tracking-wide">E.coli contamination from flooding events</p>
                    </div>
                  </div>
                </div>

                <div className="mt-16">
                  <div className="relative max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <h2 className="text-5xl font-black text-blue-500 mb-2 tracking-wider drop-shadow-lg">DID YOU</h2>
                      <h2 className="text-5xl font-black text-blue-500 tracking-wider drop-shadow-lg">KNOW?</h2>
                    </div>
                    
                    <div className="bg-white rounded-3xl border-4 border-blue-500 p-8 shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out">
                      <div className="absolute top-4 right-1">
                        <div className="relative w-20 h-20 -mt-4">
                          <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center">
                            <img src={sunPhoto} alt="Description" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pr-8 transition-all duration-500 ease-in-out text-center">
                        <h3 className="text-2xl font-black text-black mb-4 uppercase tracking-widest transition-all duration-500 drop-shadow-md">
                          {kinneretFacts[currentFact].title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed transition-all duration-500 font-medium tracking-wide">
                          {kinneretFacts[currentFact].description}
                        </p>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border-l-4 border-blue-500 transition-all duration-500">
                          <p className="text-blue-800 font-black text-xl transition-all duration-500 tracking-wide drop-shadow-sm">
                            {kinneretFacts[currentFact].value}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-6 space-x-3">
                      {kinneretFacts.map((_, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            index === currentFact 
                              ? 'bg-blue-500 scale-125 shadow-lg' 
                              : 'bg-blue-200 hover:bg-blue-300 cursor-pointer'
                          }`}
                          onClick={() => setCurrentFact(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'ecoreport':
        return (
          <div className="text-center animate-pulse">
            <h2 className="text-3xl font-bold text-green-700 mb-4">EcoReport</h2>
            <p className="text-gray-600">Environmental reports and sustainability data.</p>
          </div>
        );
        
      case 'statistics':
        return (
          <div className="text-center animate-pulse">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Statistics</h2>
            <p className="text-gray-600">Data analytics and insights.</p>
          </div>
        );
        
      case 'gallery':
        return (
          <div className="text-center animate-pulse">
            <h2 className="text-3xl font-bold text-purple-700 mb-4">Gallery</h2>
            <p className="text-gray-600">Image and media gallery.</p>
          </div>
        );
        
      case 'rag':
        return (
          <div className="text-center animate-pulse">
            <h2 className="text-3xl font-bold text-orange-700 mb-4">RAG System</h2>
            <p className="text-gray-600">Retrieval-Augmented Generation interface.</p>
          </div>
        );
        
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-200/10 via-transparent to-cyan-200/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl animate-bounce"></div>
      </div>

      <header className="relative bg-white/80 backdrop-blur-lg shadow-xl border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Droplets className="w-8 h-8 text-blue-600 animate-bounce" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
              Kinneret Pollution Monitor
            </h1>
          </div>
        </div>
      </header>

      <nav className="relative bg-white/90 backdrop-blur-lg border-b border-blue-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center space-x-3 py-4 px-6 font-medium text-sm transition-all duration-300 transform hover:scale-105 relative ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} animate-pulse`}></div>
                  )}
                  <div className="relative z-10 flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 transition-all duration-300 ${isActive ? 'animate-bounce' : 'group-hover:rotate-12'}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 transition-all duration-700">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Homepage;