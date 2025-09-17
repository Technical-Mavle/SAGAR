import React, { useRef, useEffect, useMemo, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

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

  // Force a resize after mount to ensure canvas sizes correctly in nested layouts
  useEffect(() => {
    if (!containerRef.current) return;
    const ResizeObs = (window as any).ResizeObserver;
    let ro: any | undefined;
    if (typeof ResizeObs === 'function') {
      ro = new ResizeObs((entries: any[]) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width && cr.height) {
            setDimensions({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
          }
        }
      });
      ro.observe(containerRef.current);
    }
    // Initial measure
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width && rect.height) {
      setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }
    return () => {
      if (ro && typeof ro.disconnect === 'function') {
        ro.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.08}
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
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
