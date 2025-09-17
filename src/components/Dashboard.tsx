import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiLogOut, FiHome, FiInfo, FiDatabase, FiDollarSign } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import { Project } from '../App';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectSelect }) => {
  // Mock data for projects
  const projects: Project[] = [
    {
      id: '1',
      title: 'Andaman Deep Sea Survey',
      description: 'Comprehensive survey of deep-sea biodiversity in the Andaman Sea region',
      date: '2024-01-15',
      tags: ['Benthic', 'Deep Sea'],
      progress: 75,
      waterBody: 'Andaman Sea'
    },
    {
      id: '2',
      title: 'Arabian Sea Plankton Study',
      description: 'Analysis of planktonic communities and their seasonal variations',
      date: '2024-02-03',
      tags: ['Planktonic', 'Seasonal'],
      progress: 60,
      waterBody: 'Arabian Sea'
    },
    {
      id: '3',
      title: 'Bay of Bengal Coral Reefs',
      description: 'Monitoring coral reef health and biodiversity in the Bay of Bengal',
      date: '2024-01-28',
      tags: ['Coral', 'Reef'],
      progress: 90,
      waterBody: 'Bay of Bengal'
    },
    {
      id: '4',
      title: 'Indian Ocean Deep Currents',
      description: 'Study of deep ocean currents and their impact on marine life distribution',
      date: '2024-02-10',
      tags: ['Oceanography', 'Currents'],
      progress: 45,
      waterBody: 'Indian Ocean'
    }
  ];

  return (
    <div className="min-h-screen bg-marine-blue">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-marine-blue/95 backdrop-blur-sm border-b border-marine-cyan/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-marine-cyan to-marine-green rounded-lg flex items-center justify-center">
                <span className="text-marine-blue font-bold text-sm">CM</span>
              </div>
              <span className="text-xl font-bold text-white">CMLRE Marine Explorer</span>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { name: 'Home', icon: FiHome },
                { name: 'About', icon: FiInfo },
                { name: 'Data Sources', icon: FiDatabase },
                { name: 'Pricing', icon: FiDollarSign }
              ].map((item, index) => (
                <motion.a
                  key={item.name}
                  href="#"
                  className="flex items-center space-x-2 text-gray-300 hover:text-marine-cyan transition-colors duration-200"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </nav>

            {/* User Info & Logout */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm text-gray-300">Welcome, Dr. Vinu</span>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors duration-200">
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white">
              Manage your Marine Research Projects
            </h1>
            <motion.button
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-marine-cyan to-marine-green text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="w-5 h-5" />
              <span>New Project</span>
            </motion.button>
          </motion.div>

          {/* Projects Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <ProjectCard 
                  project={project} 
                  onSelect={() => onProjectSelect(project)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
