import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFilter, FiPlus, FiActivity, FiTrendingUp, FiSearch, FiX } from 'react-icons/fi';
import { Project, DataPoint } from '../App';
import ReactGlobeComponent from './ReactGlobeComponent';
import { DataService } from '../services/dataService';

interface GlobeViewProps {
  selectedProject: Project | null;
}

const GlobeView: React.FC<GlobeViewProps> = ({ selectedProject }) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataLayer, setDataLayer] = useState<'Species Occurrences' | 'Sea Surface Temperature (SST)' | 'Salinity' | 'Chlorophyll Concentration' | 'eDNA Detections'>('Species Occurrences');
  type ActiveFilter = 
    | { type: 'species'; value: string }
    | { type: 'waterBody'; value: string }
    | { type: 'locality'; value: string }
    | { type: 'depth'; min: number; max: number }
    | { type: 'date'; start: string; end: string }
    | { type: 'method'; values: string[] };
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [newSpecies, setNewSpecies] = useState('');
  const [newWaterBody, setNewWaterBody] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [depthMin, setDepthMin] = useState<number>(0);
  const [depthMax, setDepthMax] = useState<number>(1000);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [analysisInput, setAnalysisInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const svc = DataService.getInstance();
      const pts = await svc.loadOccurrenceData();
      setDataPoints(pts);
      setIsLoading(false);
    };
    load();
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

  const liveFeedData = [
    'New species discovered in Andaman Sea',
    'Temperature anomaly detected in Arabian Sea',
    'Coral bleaching alert in Bay of Bengal',
    'Plankton bloom observed in Indian Ocean',
    'Deep sea survey completed successfully'
  ];

  const handleAnalyze = async () => {
    if (!analysisInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysisSteps([
      'Analyzing patterns in filtered occurrences...',
      'Correlating with oceanographic context (SST, salinity, chlorophyll)...',
      'Summarizing insights...'
    ]);
    await new Promise(r => setTimeout(r, 1200));
    await new Promise(r => setTimeout(r, 1200));
    await new Promise(r => setTimeout(r, 800));
    setInsight('Insight: The species Puerulus sewelli is frequently found in the Andaman Sea at depths between 300-500m. This correlates with areas of lower oxygen concentration.');
    setIsAnalyzing(false);
    setAnalysisInput('');
  };

  return (
    <div className="min-h-screen bg-marine-blue relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => window.dispatchEvent(new Event('backToProjects'))}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl backdrop-blur-sm transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </motion.button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                {selectedProject?.title ?? 'SAGAR - (Spatio-temporal Analytics Gateway for Aquatic Resources)'}
              </h1>
              <p className="text-sm text-gray-400">Interactive 3D Globe Visualization</p>
            </div>

            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="relative pt-20 h-screen flex">
        {/* Floating left sidebar container without solid background */}
        <motion.div
          className="w-80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/20 m-4 p-6 overflow-y-auto scrollbar-hide z-20"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            {/* Project blurb */}
            <div className="text-white/80 text-sm">
              {selectedProject?.description ?? 'Select a project to view details.'}
            </div>

            {/* Active Data Layer */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Active Data Layer</h3>
              <select
                value={dataLayer}
                onChange={(e) => setDataLayer(e.target.value as typeof dataLayer)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-marine-cyan focus:outline-none backdrop-blur-sm"
              >
                <option>Species Occurrences</option>
                <option>Sea Surface Temperature (SST)</option>
                <option>Salinity</option>
                <option>Chlorophyll Concentration</option>
                <option>eDNA Detections</option>
              </select>
              {dataLayer !== 'Species Occurrences' && (
                <p className="mt-2 text-xs text-white/70">Placeholder layer for future integration.</p>
              )}
            </div>

            {/* Dynamic Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Active Filters</h4>
                <motion.button
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 rounded text-white/90 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
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
                  <label className="block text-xs text-white/70 mb-1">Species Name</label>
                  <input list="species-list" value={newSpecies} onChange={(e) => setNewSpecies(e.target.value)} placeholder="e.g., Harpiliopsis depressa" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  <datalist id="species-list">
                    {uniqueSpecies.slice(0, 100).map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Water Body</label>
                  <select value={newWaterBody} onChange={(e) => setNewWaterBody(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm">
                    <option value="">Select water body</option>
                    {uniqueWaterBodies.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Location (Locality)</label>
                  <select value={newLocality} onChange={(e) => setNewLocality(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm">
                    <option value="">Select locality</option>
                    {uniqueLocalities.slice(0, 200).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Depth Range (m)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={depthMin} onChange={(e) => setDepthMin(Number(e.target.value))} placeholder="Min" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                    <input type="number" value={depthMax} onChange={(e) => setDepthMax(Number(e.target.value))} placeholder="Max" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                    <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none backdrop-blur-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Collection Method</label>
                  <select multiple value={methods} onChange={(e) => setMethods(Array.from(e.target.selectedOptions).map(o => o.value))} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-marine-cyan focus:outline-none min-h-[80px] backdrop-blur-sm">
                    {uniqueMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((f, idx) => (
                  <span key={`${f.type}-${idx}`} className="inline-flex items-center space-x-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/90 backdrop-blur-sm">
                    <span>
                      {f.type === 'species' && `Species IS ${f.value}`}
                      {f.type === 'waterBody' && `Water Body IS ${f.value}`}
                      {f.type === 'locality' && `Locality IS ${f.value}`}
                      {f.type === 'depth' && `Depth IS BETWEEN ${f.min}m AND ${f.max}m`}
                      {f.type === 'date' && `Date BETWEEN ${f.start || '...'} AND ${f.end || '...'}`}
                      {f.type === 'method' && `Method IS ${f.values.join(', ')}`}
                    </span>
                    <button onClick={() => setActiveFilters(prev => prev.filter((_, i) => i !== idx))} className="text-white/70 hover:text-white">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* AI-Powered Analysis */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                AI-Powered Analysis
              </h4>
              <div className="space-y-3">
                <textarea
                  value={analysisInput}
                  onChange={(e) => setAnalysisInput(e.target.value)}
                  placeholder="Ask a question about the data..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm resize-none focus:border-marine-cyan focus:outline-none backdrop-blur-sm"
                  rows={3}
                />
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !analysisInput.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-marine-cyan/30 to-marine-green/30 border border-marine-cyan/50 rounded-xl text-white hover:from-marine-cyan/40 hover:to-marine-green/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
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
                <div className="text-xs text-white/70 space-y-1">
                  {analysisSteps.map((s, i) => (<div key={i}>• {s}</div>))}
                </div>
                {insight && (
                  <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white/90 backdrop-blur-sm">
                    {insight}
                  </div>
                )}
              </div>
            </div>

            {/* Live Feed */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <FiActivity className="w-4 h-4 mr-2" />
                Live Reactions
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {liveFeedData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white/90 backdrop-blur-sm"
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

        {/* Full-area globe background */}
        {!isLoading && (
          <Suspense fallback={null}>
            <div className="absolute inset-0 bg-transparent">
              <ReactGlobeComponent
                dataPoints={filteredData}
                onDataPointClick={() => {}}
              />
            </div>
          </Suspense>
        )}

        {/* Center area keeps layout spacing */}
        <div className="flex-1 relative z-10">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marine-cyan mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Marine Data...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobeView;


// Sidebar inline component: Specialized Modules
const SpecializedModules: React.FC = () => {
  const [active, setActive] = useState<'Taxonomy' | 'Otolith' | 'eDNA'>('Taxonomy');

  return (
    <div>
      <h4 className="text-sm font-medium text-white mb-3">Specialized Modules</h4>
      <div className="flex items-center gap-2 mb-3">
        {['Taxonomy', 'Otolith', 'eDNA'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab as typeof active)}
            className={`px-3 py-1 rounded border text-xs backdrop-blur-sm ${
              active === tab
                ? 'border-marine-cyan text-marine-cyan bg-white/10'
                : 'border-white/20 text-white/80 hover:bg-white/10'
            }`}
          >
            {tab === 'Taxonomy' ? 'Taxonomy Explorer' : tab === 'Otolith' ? 'Otolith Morphology' : 'eDNA Matcher'}
          </button>
        ))}
      </div>
      <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white/90 backdrop-blur-sm">
        {active === 'Taxonomy' && 'Explore hierarchical relationships of taxa (placeholder).'}
        {active === 'Otolith' && 'Otolith morphology module placeholder.'}
        {active === 'eDNA' && 'eDNA matching module placeholder.'}
      </div>
    </div>
  );
};

