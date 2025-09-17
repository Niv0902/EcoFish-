import React from 'react';
import { Waves } from 'lucide-react';

const BackgroundEffects = ({ contaminants, algaeBloom }) => {
  return (
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
  );
};

export default BackgroundEffects;