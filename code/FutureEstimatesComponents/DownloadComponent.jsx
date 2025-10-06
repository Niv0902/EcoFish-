import React, { useState } from 'react';
import { Download, FileImage, FileText, BarChart3, Camera } from 'lucide-react';

const DownloadComponent = ({ currentImage, activeCategory, imageIndex, isTimelineAnimation }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleImageDownload = async (imageUrl, filename) => {
    setIsDownloading(true);
    try {
      // For GIF files, we need to handle CORS and proper blob creation
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      // For GIF files, try alternative download method
      if (filename.endsWith('.gif')) {
        try {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (fallbackError) {
          console.error('Fallback download also failed:', fallbackError);
          alert('Download failed. Please right-click the image and select "Save image as..."');
        }
      } else {
        alert('Download failed. Please try again or right-click the image to save.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDataExport = () => {
    const timelineData = [
      { year: 2010, clean: 83.4, critical: 0.3, severity: 'Low' },
      { year: 2011, clean: 83.2, critical: 0.3, severity: 'Low' },
      { year: 2012, clean: 82.8, critical: 0.4, severity: 'Low-Moderate' },
      { year: 2013, clean: 79.9, critical: 0.7, severity: 'Moderate' },
      { year: 2014, clean: 78.8, critical: 0.9, severity: 'Moderate' },
      { year: 2015, clean: 78.1, critical: 1.0, severity: 'Moderate-High' },
      { year: 2016, clean: 77.5, critical: 1.2, severity: 'Moderate-High' },
      { year: 2017, clean: 76.4, critical: 1.9, severity: 'High' },
      { year: 2018, clean: 74.9, critical: 1.8, severity: 'High' },
      { year: 2019, clean: 74.1, critical: 2.3, severity: 'Very High' },
      { year: 2020, clean: 73.3, critical: 2.7, severity: 'Critical' },
      { year: 2021, clean: 72.7, critical: 2.7, severity: 'Critical' },
      { year: 2022, clean: 71.8, critical: 2.6, severity: 'High-Critical' },
      { year: 2023, clean: 69.7, critical: 2.5, severity: 'High-Critical' }
    ];

    const csvContent = [
      ['Year', 'Clean Areas (%)', 'Critical Areas (%)', 'Severity Level'],
      ...timelineData.map(row => [row.year, row.clean, row.critical, row.severity])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kinneret_timeline_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getImageFilename = () => {
    if (activeCategory === 'timeline') {
      const names = ['initial_states', 'final_states', 'timeline_animation'];
      const filename = `kinneret_${names[imageIndex]}.${imageIndex === 2 ? 'gif' : 'png'}`;
      console.log('Timeline download:', { activeCategory, imageIndex, filename });
      return filename;
    }
    if (activeCategory === 'cellular') {
      return `kinneret_${activeCategory}.gif`;
    }
    const filename = `kinneret_${activeCategory}.png`;
    console.log('Regular download:', { activeCategory, filename });
    return filename;
  };


  // Determine what to show based on current screen
  const getContextualButtons = () => {
    const buttons = [];

    // Always show current image download
    buttons.push({
      key: 'current',
      label: `Download`,
      icon: FileImage,
      action: () => handleImageDownload(currentImage.src, getImageFilename()),
      color: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    });

    // ONLY for timeline animation, add data export
    if (isTimelineAnimation) {
      buttons.push({
        key: 'data',
        label: 'Export Timeline Data (CSV)',
        icon: FileText,
        action: handleDataExport,
        color: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
      });
    }

    return buttons;
  };

  const contextualButtons = getContextualButtons();

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {contextualButtons.map((button) => {
        const IconComponent = button.icon;
        return (
          <button
            key={button.key}
            onClick={button.action}
            disabled={isDownloading}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 flex items-center gap-2 ${button.color} ${
              isDownloading ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
            }`}
          >
            {isDownloading ? (
              <>
                Downloading...
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </>
            ) : (
              <>
                {button.label}
                <IconComponent className="w-4 h-4" />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DownloadComponent;