import React from 'react';
import { Droplets } from 'lucide-react';

const Header = () => {
  return (
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
  );
};

export default Header;