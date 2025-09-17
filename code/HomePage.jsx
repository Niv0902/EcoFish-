import React, { useState } from 'react';
import { Home, FileText, BarChart3, Image, Brain } from 'lucide-react';

const Homepage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ecoreport', label: 'EcoReport', icon: FileText },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'rag', label: 'RAG', icon: Brain }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome Home</h2>
            <p className="text-gray-600">This is the home page content.</p>
          </div>
        );
      case 'ecoreport':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-700 mb-4">EcoReport</h2>
            <p className="text-gray-600">Environmental reports and sustainability data.</p>
          </div>
        );
      case 'statistics':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Statistics</h2>
            <p className="text-gray-600">Data analytics and insights.</p>
          </div>
        );
      case 'gallery':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-purple-700 mb-4">Gallery</h2>
            <p className="text-gray-600">Image and media gallery.</p>
          </div>
        );
      case 'rag':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-orange-700 mb-4">RAG System</h2>
            <p className="text-gray-600">Retrieval-Augmented Generation interface.</p>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Website</h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Homepage;