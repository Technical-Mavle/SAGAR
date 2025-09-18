import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Globe from 'react-globe.gl';
import { DataPoint } from '../App';

interface ReactGlobeComponentProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
  autoRotate?: boolean;
  focusOnData?: boolean;
}

const ReactGlobeComponent: React.FC<ReactGlobeComponentProps> = ({ 
  dataPoints, 
  onDataPointClick,
  autoRotate = true,
  focusOnData = false
}) => {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  // Handle point hover
  const handlePointHover = (point: any, prevPoint: any) => {
    if (point?.data) {
      setHoveredPoint(point.data);
      // Calculate tooltip position based on mouse coordinates
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
    } else {
      setHoveredPoint(null);
    }
  };

  // Auto-rotate the globe and set dark styling
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls?.();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.0;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = true;
      }

      // Focus on data points if requested
      if (focusOnData && dataPoints.length > 0) {
        const avgLat = dataPoints.reduce((sum, p) => sum + p.decimalLatitude, 0) / dataPoints.length;
        const avgLng = dataPoints.reduce((sum, p) => sum + p.decimalLongitude, 0) / dataPoints.length;
        
        // Use globe's built-in pointOfView method for proper focusing
        try {
          const g = globeRef.current;
          if (g?.pointOfView) {
            // Set point of view to focus on the average coordinates
            g.pointOfView({ lat: avgLat, lng: avgLng, altitude: 2.5 });
          }
        } catch (error) {
          console.log('Focus adjustment failed:', error);
        }
      }

      // Dark theme tuning (react-globe.gl exposes ThreeJS objects via scene())
      try {
        const g = globeRef.current;
        g?.showAtmosphere(true);
        g?.atmosphereColor('#ffffff');
        g?.atmosphereAltitude(0.08);
      } catch {}
    }
  }, [autoRotate, focusOnData, dataPoints]);

  // Force a resize after mount to ensure canvas sizes correctly in nested layouts
  useEffect(() => {
    if (!containerRef.current) return;
    const ResizeObs = (window as any).ResizeObserver;
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObs === 'function') {
      ro = new ResizeObs((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width && cr.height) {
            setDimensions({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
          }
        }
      });
      ro?.observe(containerRef.current);
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
    <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'relative' }}>
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
        onPointHover={handlePointHover}
      />
      
      {/* Hover Tooltip */}
      {hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 shadow-2xl min-w-[280px]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getWaterBodyColor(hoveredPoint.waterBody) }}></div>
                <h4 className="text-sm font-semibold text-white">Location Details</h4>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Species:</span>
                  <span className="text-gray-200">{hoveredPoint.scientificName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Locality:</span>
                  <span className="text-gray-200">{hoveredPoint.locality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coordinates:</span>
                  <span className="text-gray-200">{hoveredPoint.decimalLatitude.toFixed(4)}°, {hoveredPoint.decimalLongitude.toFixed(4)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Water Body:</span>
                  <span className="text-gray-200">{hoveredPoint.waterBody}</span>
                </div>
                {hoveredPoint.eventDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-gray-200">{new Date(hoveredPoint.eventDate).toLocaleDateString()}</span>
                  </div>
                )}
                {hoveredPoint.samplingProtocol && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Method:</span>
                    <span className="text-gray-200">{hoveredPoint.samplingProtocol}</span>
                  </div>
                )}
                {Boolean(hoveredPoint.minimumDepthInMeters || hoveredPoint.maximumDepthInMeters) && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Depth:</span>
                    <span className="text-gray-200">
                      {hoveredPoint.minimumDepthInMeters || '—'}m - {hoveredPoint.maximumDepthInMeters || '—'}m
                    </span>
                  </div>
                )}
                {hoveredPoint.identifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Identified by:</span>
                    <span className="text-gray-200">{hoveredPoint.identifiedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReactGlobeComponent;
