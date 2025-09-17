import React from 'react';
import { Home, FileText, BarChart3, Image, Brain } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, color: 'from-blue-600 to-cyan-700' },
    { id: 'ecoreport', label: 'EcoReport', icon: FileText, color: 'from-green-600 to-emerald-700' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, color: 'from-red-600 to-orange-700' },
    { id: 'gallery', label: 'Gallery', icon: Image, color: 'from-purple-600 to-pink-700' },
    { id: 'rag', label: 'RAG', icon: Brain, color: 'from-indigo-600 to-purple-700' }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-blue-200/30 sticky top-0 z-50">
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
  );
};

export default Navigation;