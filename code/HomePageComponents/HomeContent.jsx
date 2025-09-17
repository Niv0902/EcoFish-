import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import BackgroundEffects from './BackgroundEffects';
import PollutionCards from './PollutionCards';
import FactsSection from './FactsSection';

const HomeContent = ({ contaminants, algaeBloom, kinneretFacts, currentFact, setCurrentFact }) => {
  return (
    <div className="relative min-h-[800px] overflow-hidden">
      <BackgroundEffects contaminants={contaminants} algaeBloom={algaeBloom} />

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
          
          <PollutionCards />
          <FactsSection 
            kinneretFacts={kinneretFacts} 
            currentFact={currentFact} 
            setCurrentFact={setCurrentFact} 
          />
        </div>
      </div>
    </div>
  );
};

export default HomeContent;