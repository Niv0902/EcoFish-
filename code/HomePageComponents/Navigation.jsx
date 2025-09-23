import React from 'react';
import { Home, FileText, BarChart3, Image, Brain, Download } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'from-blue-600 to-cyan-700' },
    { id: 'ecoreport', label: 'EcoReport', icon: FileText, color: 'from-green-600 to-emerald-700' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, color: 'from-red-600 to-orange-700' },
    { id: 'pollutionEstimates', label: 'Pollution Estimates', icon: BarChart3, color: 'from-red-600 to-yellow-500' },
    { id: 'gallery', label: 'Gallery', icon: Image, color: 'from-purple-600 to-pink-700' }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-200/30 sticky top-0 z-50">
  <div className="w-full max-w-screen-xl mx-auto px-4">
  <div className="flex flex-wrap space-x-2 overflow-x-visible">
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
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} animate-tabpop`}></div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                )}
                <div className="relative z-10 flex items-center space-x-3">
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <IconComponent className={`w-5 h-5 transition-all duration-300 ${isActive ? 'animate-bounce' : 'group-hover:rotate-12'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Add custom animation for tab pop
const style = document.createElement('style');
style.innerHTML = `
@keyframes tabpop {
  0% { transform: scale(0.8); opacity: 0.5; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-tabpop {
  animation: tabpop 0.5s cubic-bezier(.4,0,.2,1);
}
`;
document.head.appendChild(style);

export default Navigation;