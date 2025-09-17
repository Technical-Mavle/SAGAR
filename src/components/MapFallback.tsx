import React from 'react';
import { DataPoint } from '../App';

interface MapFallbackProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
}

const MapFallback: React.FC<MapFallbackProps> = ({ dataPoints, onDataPointClick }) => {
  // Get color based on water body
  const getWaterBodyColor = (waterBody: string) => {
    switch (waterBody) {
      case 'Arabian Sea':
        return '#00ff88';
      case 'Bay of Bengal':
        return '#ffd700';
      case 'Andaman Sea':
        return '#00d4ff';
      default:
        return '#ff6b35';
    }
  };

  // Calculate bounds for the map
  const bounds = dataPoints.reduce(
    (acc, point) => ({
      minLat: Math.min(acc.minLat, point.decimalLatitude),
      maxLat: Math.max(acc.maxLat, point.decimalLatitude),
      minLng: Math.min(acc.minLng, point.decimalLongitude),
      maxLng: Math.max(acc.maxLng, point.decimalLongitude),
    }),
    {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity,
    }
  );

  return (
    <div className="flex items-center justify-center h-full bg-marine-blue relative">
      <div className="text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-marine-cyan/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-marine-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">2D Map View</h3>
          <p className="text-gray-400 mb-4">
            WebGL 3D rendering is not available. Showing 2D map instead.
          </p>
        </div>

        {/* 2D Map Visualization */}
        <div className="relative w-96 h-96 mx-auto bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Map View</div>
          </div>
          
          {/* Data Points */}
          {dataPoints.map((point, index) => {
            const x = ((point.decimalLongitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
            const y = ((bounds.maxLat - point.decimalLatitude) / (bounds.maxLat - bounds.minLat)) * 100;
            
            return (
              <div
                key={index}
                className="absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-200"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: getWaterBodyColor(point.waterBody),
                  boxShadow: `0 0 10px ${getWaterBodyColor(point.waterBody)}50`,
                }}
                onClick={() => onDataPointClick(point)}
                title={`${point.scientificName} - ${point.locality}`}
              />
            );
          })}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>Click on data points to view details</p>
          <p className="mt-2">
            Total data points: <span className="text-marine-cyan font-bold">{dataPoints.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapFallback;
