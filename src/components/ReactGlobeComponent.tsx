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

  // Auto-rotate the globe and set dark styling
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = true;
      }

      // Dark theme tuning (react-globe.gl exposes ThreeJS objects via scene())
      try {
        const g = globeRef.current;
        g.showAtmosphere(true);
        g.atmosphereColor('#ffffff');
        g.atmosphereAltitude(0.08);
      } catch {}
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.08}
        pointsData={globeData}
        pointColor={() => 'rgba(255,255,255,0.9)'}
        pointAltitude={0.015}
        pointRadius={0.55}
        pointResolution={6}
        pointsMerge={false}
        enablePointerInteraction
        onPointClick={handlePointClick}
      />
    </div>
  );
};

export default ReactGlobeComponent;
