import React, { useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { DataPoint } from '../App';

interface ReactGlobeComponentProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
}

const ReactGlobeComponent: React.FC<ReactGlobeComponentProps> = ({ 
  dataPoints, 
  onDataPointClick 
}) => {
  const globeRef = useRef<any>(null);

  // Get color based on water body
  const getWaterBodyColor = (waterBody: string) => {
    switch (waterBody) {
      case 'Arabian Sea':
        return '#00ff88'; // marine-green
      case 'Bay of Bengal':
        return '#ffd700'; // marine-yellow
      case 'Andaman Sea':
        return '#00d4ff'; // marine-cyan
      default:
        return '#ff6b35'; // marine-orange
    }
  };

  // Prepare data for react-globe.gl
  const globeData = useMemo(() => {
    return dataPoints.map((point, index) => ({
      lat: point.decimalLatitude,
      lng: point.decimalLongitude,
      size: 0.5,
      color: getWaterBodyColor(point.waterBody),
      data: point,
      index
    }));
  }, [dataPoints]);

  // Handle point click
  const handlePointClick = (point: any) => {
    if (point.data) {
      onDataPointClick(point.data);
    }
  };

  // Auto-rotate the globe
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere={true}
        atmosphereColor="#00d4ff"
        atmosphereAltitude={0.1}
        pointsData={globeData}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius={0.5}
        pointResolution={8}
        pointsMerge={false}
        onPointClick={handlePointClick}
      />
    </div>
  );
};

export default ReactGlobeComponent;
