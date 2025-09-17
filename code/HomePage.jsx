import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeContent from './components/HomeContent';

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
          <HomeContent 
            contaminants={contaminants}
            algaeBloom={algaeBloom}
            kinneretFacts={kinneretFacts}
            currentFact={currentFact}
            setCurrentFact={setCurrentFact}
          />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 transition-all duration-700">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Homepage;