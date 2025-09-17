import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiCalendar, FiEye, FiUser } from 'react-icons/fi';
import { DataPoint } from '../App';

interface DataModalProps {
  dataPoint: DataPoint;
  onClose: () => void;
}

const DataModal: React.FC<DataModalProps> = ({ dataPoint, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {dataPoint.scientificName}
            </h2>
            <div className="flex items-center text-marine-cyan">
              <FiMapPin className="w-4 h-4 mr-2" />
              <span>{dataPoint.locality}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Event Date */}
            <div className="flex items-center space-x-3">
              <FiCalendar className="w-5 h-5 text-marine-green" />
              <div>
                <p className="text-sm text-gray-400">Event Date</p>
                <p className="text-white font-medium">
                  {new Date(dataPoint.eventDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Water Body */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-marine-cyan"></div>
              <div>
                <p className="text-sm text-gray-400">Water Body</p>
                <p className="text-white font-medium">{dataPoint.waterBody}</p>
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Latitude</p>
                <p className="text-white font-medium">{dataPoint.decimalLatitude}°</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Longitude</p>
                <p className="text-white font-medium">{dataPoint.decimalLongitude}°</p>
              </div>
            </div>

            {/* Sampling Details */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiEye className="w-5 h-5 mr-2 text-marine-cyan" />
                Sampling Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Protocol</p>
                  <p className="text-white font-medium">{dataPoint.samplingProtocol}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Min Depth</p>
                    <p className="text-white font-medium">{dataPoint.minimumDepthInMeters}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Max Depth</p>
                    <p className="text-white font-medium">{dataPoint.maximumDepthInMeters}m</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUser className="w-4 h-4 text-marine-green" />
                  <div>
                    <p className="text-sm text-gray-400">Identified By</p>
                    <p className="text-white font-medium">{dataPoint.identifiedBy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-marine-cyan to-marine-green text-marine-blue font-semibold rounded-lg hover:shadow-lg hover:shadow-marine-cyan/25 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Record
              </motion.button>
              <motion.button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-white font-medium rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataModal;
