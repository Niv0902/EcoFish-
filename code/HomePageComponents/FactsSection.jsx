import React from 'react';
import sunPhoto from '../assets/sun.webp';

const FactsSection = ({ kinneretFacts, currentFact, setCurrentFact }) => {
  return (
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
  );
};

export default FactsSection;