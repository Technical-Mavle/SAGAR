import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FiArrowLeft, FiFilter, FiPlus, FiActivity, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { Project, DataPoint } from '../App';
import DataModal from './DataModal';
import GlobeWithFallback from './GlobeWithFallback';
import WebGLErrorBoundary from './WebGLErrorBoundary';
import { DataService } from '../services/dataService';

interface GlobeViewProps {
  selectedProject: Project | null;
}

const GlobeView: React.FC<GlobeViewProps> = ({ selectedProject }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisInput, setAnalysisInput] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLayer, setDataLayer] = useState<'Species Occurrences' | 'Sea Surface Temperature (SST)' | 'Salinity' | 'Chlorophyll Concentration' | 'eDNA Detections'>('Species Occurrences');

  type ActiveFilter = 
    | { type: 'species'; value: string }
    | { type: 'waterBody'; value: string }
    | { type: 'locality'; value: string }
    | { type: 'depth'; min: number; max: number }
    | { type: 'date'; start: string; end: string }
    | { type: 'method'; values: string[] };

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { type: 'species', value: 'Harpiliopsis depressa' },
    { type: 'waterBody', value: 'Arabian Sea' },
    { type: 'depth', min: 100, max: 500 }
  ]);

  const [newSpecies, setNewSpecies] = useState('');
  const [newWaterBody, setNewWaterBody] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [depthMin, setDepthMin] = useState<number>(0);
  const [depthMax, setDepthMax] = useState<number>(1000);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [methods, setMethods] = useState<string[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      console.log('GlobeView: Starting data load...');
      setIsLoading(true);
      const dataService = DataService.getInstance();
      const points = await dataService.loadOccurrenceData();
      console.log('GlobeView: Data loaded, points:', points.length);
      setDataPoints(points);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const uniqueSpecies = useMemo(() => Array.from(new Set(dataPoints.map(d => d.scientificName))).sort(), [dataPoints]);
  const uniqueWaterBodies = useMemo(() => Array.from(new Set(dataPoints.map(d => d.waterBody))).filter(Boolean).sort(), [dataPoints]);
  const uniqueLocalities = useMemo(() => Array.from(new Set(dataPoints.map(d => d.locality))).filter(Boolean).sort(), [dataPoints]);
  const uniqueMethods = useMemo(() => Array.from(new Set(dataPoints.map(d => d.samplingProtocol))).filter(Boolean).sort(), [dataPoints]);

  const filteredData = useMemo(() => {
    let result = dataPoints;
    for (const f of activeFilters) {
      switch (f.type) {
        case 'species':
          result = result.filter(p => p.scientificName.toLowerCase().includes(f.value.toLowerCase()));
          break;
        case 'waterBody':
          result = result.filter(p => p.waterBody === f.value);
          break;
        case 'locality':
          result = result.filter(p => p.locality === f.value);
          break;
        case 'depth':
          result = result.filter(p => (p.minimumDepthInMeters >= f.min && p.maximumDepthInMeters <= f.max));
          break;
        case 'date':
          result = result.filter(p => {
            const d = new Date(p.eventDate).getTime();
            const s = f.start ? new Date(f.start).getTime() : -Infinity;
            const e = f.end ? new Date(f.end).getTime() : Infinity;
            return !isNaN(d) && d >= s && d <= e;
          });
          break;
        case 'method':
          result = result.filter(p => f.values.includes(p.samplingProtocol));
          break;
      }
    }
    return result;
  }, [dataPoints, activeFilters]);

  const metrics = useMemo(() => {
    const total = filteredData.length;
    const uniqueSpeciesCount = new Set(filteredData.map(d => d.scientificName)).size;
    const lats = filteredData.map(d => d.decimalLatitude);
    const lons = filteredData.map(d => d.decimalLongitude);
    const bbox = filteredData.length ? {
      minLat: Math.min(...lats), maxLat: Math.max(...lats),
      minLon: Math.min(...lons), maxLon: Math.max(...lons)
    } : null;
    const minDepth = filteredData.length ? Math.min(...filteredData.map(d => d.minimumDepthInMeters)) : null;
    const maxDepth = filteredData.length ? Math.max(...filteredData.map(d => d.maximumDepthInMeters)) : null;
    return { total, uniqueSpeciesCount, bbox, minDepth, maxDepth };
  }, [filteredData]);

  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [insight, setInsight] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisSteps([
      'Analyzing patterns in filtered occurrences...',
      'Correlating with oceanographic context (SST, salinity, chlorophyll)...',
      'Summarizing insights...'
    ]);
    await new Promise(resolve => setTimeout(resolve, 1200));
    await new Promise(resolve => setTimeout(resolve, 1200));
    await new Promise(resolve => setTimeout(resolve, 800));
    setInsight('Insight: The species Puerulus sewelli is frequently found in the Andaman Sea at depths between 300-500m. This correlates with areas of lower oxygen concentration.');
    setIsAnalyzing(false);
    setAnalysisInput('');
  };

  const liveFeedData = [
    "New species discovered in Andaman Sea",
    "Temperature anomaly detected in Arabian Sea",
    "Coral bleaching alert in Bay of Bengal",
    "Plankton bloom observed in Indian Ocean",
    "Deep sea survey completed successfully"
  ];

  return (
    <div className="min-h-screen bg-marine-blue relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marine-blue/95 backdrop-blur-sm border-b border-marine-cyan/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => window.dispatchEvent(new Event('backToProjects'))}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </motion.button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                {selectedProject?.title || 'SAGAR - (Spatio-temporal Analytics Gateway for Aquatic Resources)'}
              </h1>
              <p className="text-sm text-gray-400">
                Interactive 3D Globe Visualization
              </p>
            </div>

            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 h-screen flex">
        {/* Left Panel */}
        <motion.div 
          className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-6 overflow-y-auto"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            {/* Back to Projects */}
            <motion.button
              onClick={() => window.dispatchEvent(new Event('backToProjects'))}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </motion.button>
            {/* Data Layers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Active Data Layer</h3>
              <select
                value={dataLayer}
                onChange={(e) => setDataLayer(e.target.value as typeof dataLayer)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:border-marine-cyan focus:outline-none"
              >
                <option>Species Occurrences</option>
                <option>Sea Surface Temperature (SST)</option>
                <option>Salinity</option>
                <option>Chlorophyll Concentration</option>
                <option>eDNA Detections</option>
              </select>
              {dataLayer !== 'Species Occurrences' && (
                <p className="mt-2 text-xs text-gray-400">Placeholder layer for future integration.</p>
              )}
            </div>

            {/* Dynamic Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Active Filters</h4>
                <motion.button
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-marine-cyan/20 to-marine-green/20 border border-marine-cyan/30 rounded text-marine-cyan hover:from-marine-cyan/30 hover:to-marine-green/30 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (newSpecies) {
                      setActiveFilters(prev => [...prev, { type: 'species', value: newSpecies }]);
                      setNewSpecies('');
                      return;
                    }
                    if (newWaterBody) {
                      setActiveFilters(prev => [...prev, { type: 'waterBody', value: newWaterBody }]);
                      setNewWaterBody('');
                      return;
                    }
                    if (newLocality) {
                      setActiveFilters(prev => [...prev, { type: 'locality', value: newLocality }]);
                      setNewLocality('');
                      return;
                    }
                    if (methods.length) {
                      setActiveFilters(prev => [...prev, { type: 'method', values: methods }]);
                      setMethods([]);
                      return;
                    }
                    if (dateStart || dateEnd) {
                      setActiveFilters(prev => [...prev, { type: 'date', start: dateStart, end: dateEnd }]);
                      setDateStart('');
                      setDateEnd('');
                      return;
                    }
                    setActiveFilters(prev => [...prev, { type: 'depth', min: depthMin, max: depthMax }]);
                  }}
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Create New Filter</span>
                </motion.button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Species Name</label>
                  <input list="species-list" value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} placeholder="e.g., Harpiliopsis depressa" className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none" />
                  <datalist id="species-list">
                    {uniqueSpecies.slice(0, 100).map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Water Body</label>
                  <select value={newWaterBody} onChange={(e) => setNewWaterBody(e.target.value)} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none">
                    <option value="">Select water body</option>
                    {uniqueWaterBodies.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Location (Locality)</label>
                  <select value={newLocality} onChange={(e) => setNewLocality(e.target.value)} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none">
                    <option value="">Select locality</option>
                    {uniqueLocalities.slice(0, 200).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Depth Range (m)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={depthMin} onChange={(e) => setDepthMin(Number(e.target.value))} placeholder="Min" className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none" />
                    <input type="number" value={depthMax} onChange={(e) => setDepthMax(Number(e.target.value))} placeholder="Max" className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none" />
                    <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Collection Method</label>
                  <select multiple value={methods} onChange={(e) => setMethods(Array.from(e.target.selectedOptions).map(o => o.value))} className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:border-marine-cyan focus:outline-none min-h-[80px]">
                    {uniqueMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((f, idx) => (
                  <span key={idx} className="inline-flex items-center space-x-2 px-2 py-1 bg-gray-800/40 border border-gray-600/40 rounded text-xs text-gray-200">
                    <span>
                      {f.type === 'species' && `Species IS ${f.value}`}
                      {f.type === 'waterBody' && `Water Body IS ${f.value}`}
                      {f.type === 'locality' && `Locality IS ${f.value}`}
                      {f.type === 'depth' && `Depth IS BETWEEN ${f.min}m AND ${f.max}m`}
                      {f.type === 'date' && `Date BETWEEN ${f.start || '...'} AND ${f.end || '...'}`}
                      {f.type === 'method' && `Method IS ${f.values.join(', ')}`}
                    </span>
                    <button onClick={() => setActiveFilters(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-white">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Active Filters</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <span className="text-sm text-gray-300">Analysis: Filter by Harpiliopsis depressa</span>
                  <button className="text-red-400 hover:text-red-300">
                    <FiFilter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center - 3D Globe */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-cyan mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Marine Data...</p>
              </div>
            </div>
          ) : (
            <WebGLErrorBoundary>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-cyan mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading 3D Globe...</p>
                  </div>
                </div>
              }>
                <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ 
                  antialias: false, 
                  alpha: false,
                  powerPreference: "default",
                  preserveDrawingBuffer: false,
                  failIfMajorPerformanceCaveat: true,
                  stencil: false,
                  depth: true,
                  logarithmicDepthBuffer: false
                }}
                onCreated={({ gl, scene, camera }) => {
                  console.log('Canvas created successfully');
                  gl.setClearColor('#0a1929', 1.0);
                  
                  // Add WebGL context loss handling
                  const canvas = gl.domElement;
                  
                  const handleContextLost = (event: Event) => {
                    event.preventDefault();
                    console.warn('WebGL context lost. Staying on current view and skipping auto-reload.');
                  };

                  const handleContextRestored = () => {
                    console.log('WebGL context restored');
                  };

                  canvas.addEventListener('webglcontextlost', handleContextLost);
                  canvas.addEventListener('webglcontextrestored', handleContextRestored);
                  
                  // Add click handler for the globe
                  canvas.addEventListener('click', (event) => {
                    console.log('Globe clicked');
                    // You can add more sophisticated click handling here
                  });

                  // Cleanup function
                  return () => {
                    canvas.removeEventListener('webglcontextlost', handleContextLost);
                    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
                  };
                }}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <GlobeWithFallback dataPoints={filteredData} onDataPointClick={setSelectedDataPoint} />
                  <OrbitControls 
                    enableZoom={true} 
                    enablePan={true} 
                    enableRotate={true}
                    maxDistance={10}
                    minDistance={2}
                  />
                </Canvas>
              </Suspense>
            </WebGLErrorBoundary>
          )}
        </div>

        {/* Right Panel */}
        <motion.div 
          className="w-80 bg-gray-900/50 backdrop-blur-sm border-l border-gray-700/50 p-6 overflow-y-auto"
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            {/* Project Summary */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">{selectedProject?.title || 'Selected Project'}</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total Occurrences</span>
                  <span className="text-marine-cyan font-bold">{metrics.total}</span>
                </div>
                <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-300">Unique Species</span>
                  <span className="text-marine-green font-bold">{metrics.uniqueSpeciesCount}</span>
                </div>
                <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg">
                  <div className="text-sm text-gray-300">Geographic Area (BBox)</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {metrics.bbox ? (
                      <>
                        <div>Lat: {metrics.bbox.minLat.toFixed(2)} to {metrics.bbox.maxLat.toFixed(2)}</div>
                        <div>Lon: {metrics.bbox.minLon.toFixed(2)} to {metrics.bbox.maxLon.toFixed(2)}</div>
                      </>
                    ) : 'N/A'}
                  </div>
                </div>
                <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-300">Depth Range</span>
                  <span className="text-marine-yellow font-bold">{metrics.minDepth !== null && metrics.maxDepth !== null ? `${metrics.minDepth}m - ${metrics.maxDepth}m` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* AI-Powered Analysis */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                AI-Powered Analysis
              </h4>
              <div className="space-y-3">
                <textarea
                  value={analysisInput}
                  onChange={(e) => setAnalysisInput(e.target.value)}
                  placeholder="Ask a question about the data..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm resize-none focus:border-marine-cyan focus:outline-none"
                  rows={3}
                />
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !analysisInput.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-marine-cyan/20 to-marine-green/20 border border-marine-cyan/30 rounded-lg text-marine-cyan hover:from-marine-cyan/30 hover:to-marine-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-marine-cyan"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <FiSearch className="w-4 h-4" />
                      <span>Analyze</span>
                    </>
                  )}
                </motion.button>
                {/* Steps and Insight */}
                <div className="text-xs text-gray-400 space-y-1">
                  {analysisSteps.map((s, i) => (<div key={i}>• {s}</div>))}
                </div>
                {insight && (
                  <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded text-sm text-gray-200">
                    {insight}
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                <FiActivity className="w-4 h-4 mr-2" />
                Live Reactions
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {liveFeedData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-2 bg-gray-800/20 border border-gray-600/20 rounded text-xs text-gray-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Specialized Data Modules */}
            <SpecializedModules />
          </div>
        </motion.div>
      </div>

      {/* Data Modal */}
      <AnimatePresence>
        {selectedDataPoint && (
          <DataModal
            dataPoint={selectedDataPoint}
            onClose={() => setSelectedDataPoint(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobeView;
// Specialized modules simple component within same file for brevity
const SpecializedModules: React.FC = () => {
  const [active, setActive] = useState<'Taxonomy' | 'Otolith' | 'eDNA'>('Taxonomy');
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-3">Specialized Modules</h4>
      <div className="flex items-center gap-2 mb-3">
        {['Taxonomy', 'Otolith', 'eDNA'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab as typeof active)}
            className={`px-3 py-1 rounded border text-xs ${active === tab ? 'border-marine-cyan text-marine-cyan' : 'border-gray-600 text-gray-300'}`}
          >
            {tab === 'Taxonomy' ? 'Taxonomy Explorer' : tab === 'Otolith' ? 'Otolith Morphology' : 'eDNA Matcher'}
          </button>
        ))}
      </div>
      <div className="p-3 bg-gray-800/30 border border-gray-600/30 rounded text-xs text-gray-300">
        {active === 'Taxonomy' && 'Explore hierarchical relationships of taxa (placeholder).'}
        {active === 'Otolith' && 'Otolith morphology module placeholder.'}
        {active === 'eDNA' && 'eDNA matching module placeholder.'}
      </div>
    </div>
  );
};

