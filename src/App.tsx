import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import GlobeView from './components/GlobeView';
import LoaderOverlay from './components/LoaderOverlay';
import SearchResultsView, { SearchResultSummary } from './components/SearchResultsView';
import './App.css';

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  progress: number;
  waterBody: string;
}

export interface DataPoint {
  scientificName: string;
  locality: string;
  eventDate: string;
  decimalLatitude: number;
  decimalLongitude: number;
  waterBody: string;
  samplingProtocol: string;
  minimumDepthInMeters: number;
  maximumDepthInMeters: number;
  identifiedBy: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'search' | 'globe'>('landing');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLoader, setShowLoader] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<SearchResultSummary | null>(null);

  const handleProjectSelect = (project: Project) => {
    console.log('App: Project selected, navigating to globe view');
    setShowLoader(true);
    setTimeout(() => {
      setSelectedProject(project);
      setCurrentView('globe');
      setShowLoader(false);
    }, 800);
  };

  React.useEffect(() => {
    const handler = () => {
      console.log('App: Back to Projects event received');
      setShowLoader(true);
      setTimeout(() => {
        setCurrentView('dashboard');
        setSelectedProject(null);
        setShowLoader(false);
      }, 600);
    };
    window.addEventListener('backToProjects', handler as EventListener);
    return () => window.removeEventListener('backToProjects', handler as EventListener);
  }, []);



  console.log('App: Current view:', currentView, 'Selected project:', selectedProject?.title);

  const rootBgClass = currentView === 'search' ? 'bg-black' : 'bg-marine-blue';
  return (
    <div className={`min-h-screen ${rootBgClass} text-white`}>
      <LoaderOverlay visible={showLoader} />
      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onEnter={() => setCurrentView('dashboard')} />
          </motion.div>
        ) : currentView === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard onProjectSelect={handleProjectSelect} />
          </motion.div>
        ) : currentView === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {searchResult && (
              <div className="pt-24 px-6 max-w-7xl mx-auto">
                <SearchResultsView
                  result={searchResult}
                  onViewOnGlobe={() => setCurrentView('globe')}
                  onBack={() => {
                    const t = (window as any).__sagarTransition;
                    if (t?.overlay) {
                      t.overlay.remove();
                      (window as any).__sagarTransition = undefined;
                    }
                    setCurrentView('globe');
                  }}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="globe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlobeView 
              selectedProject={selectedProject}
              onShowSearchResults={(result) => {
                // Show loader during transition into SearchResultsView
                setShowLoader(true);
                setSearchResult(result);
                setCurrentView('search');
                // Hide after brief delay to cover render/texture loads
                setTimeout(() => setShowLoader(false), 900);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
