import React from 'react';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import WorldMap from './ui/world-map';
import ReactGlobeComponent from './ReactGlobeComponent';
import { DataPoint } from '../App';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export interface SearchResultSummary {
  scientificName: string;
  description?: string;
  locality?: string;
  basisOfRecord?: string;
  minDepthInMeters?: number | null;
  maxDepthInMeters?: number | null;
  coordinates?: { lat: number; lng: number } | null;
  occurrencesByYear?: Array<{ year: number; count: number }>; // from eventDate
  depthHistogram?: Array<{ depth: number; count: number }>;
}

interface SearchResultsViewProps {
  result: SearchResultSummary;
  onViewOnGlobe?: () => void;
  onBack?: () => void;
}

const cardClass =
  'bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6';

const headingClass = 'text-2xl md:text-3xl font-bold text-white';

const labelClass = 'text-sm text-gray-400';
const valueClass = 'text-sm text-gray-200';

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ result, onViewOnGlobe, onBack }) => {
  const {
    scientificName,
    description,
    locality,
    basisOfRecord,
    minDepthInMeters,
    maxDepthInMeters,
    coordinates,
    occurrencesByYear = [],
    depthHistogram = [],
  } = result;

  const hasCoords = Boolean(coordinates && !Number.isNaN(coordinates.lat) && !Number.isNaN(coordinates.lng));

  const years = occurrencesByYear
    .slice()
    .sort((a, b) => a.year - b.year);

  const occurrencesBarData = {
    labels: years.map((d) => String(d.year)),
    datasets: [
      {
        label: 'Occurrences',
        data: years.map((d) => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.35)', // marine-green with opacity
        borderColor: 'rgba(34, 197, 94, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const depthSorted = depthHistogram
    .slice()
    .sort((a, b) => a.depth - b.depth);

  const depthLineData = {
    labels: depthSorted.map((d) => `${d.depth}m`),
    datasets: [
      {
        label: 'Sightings',
        data: depthSorted.map((d) => d.count),
        fill: true,
        backgroundColor: 'rgba(14, 165, 233, 0.20)', // marine-cyan
        borderColor: 'rgba(14, 165, 233, 0.9)',
        pointRadius: 2,
        tension: 0.35,
      },
    ],
  };

  const commonChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(75,85,99,0.2)' },
      },
    },
  };

  const globePoints: DataPoint[] = coordinates
    ? [{
        scientificName: scientificName || 'Unknown',
        locality: locality || 'Unknown',
        eventDate: new Date().toISOString(),
        decimalLatitude: coordinates.lat,
        decimalLongitude: coordinates.lng,
        waterBody: '',
        samplingProtocol: '',
        minimumDepthInMeters: typeof minDepthInMeters === 'number' ? minDepthInMeters : 0,
        maximumDepthInMeters: typeof maxDepthInMeters === 'number' ? maxDepthInMeters : 0,
        identifiedBy: ''
      }]
    : [];

  return (
    <div className="w-full bg-black">
      {/* Back button */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            <FiArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Globe</span>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(0,auto)] gap-6">
        {/* Primary Result Card - larger, spans 2 cols x 2 rows on large screens */}
        <section className={`${cardClass} lg:col-span-2 lg:row-span-2`}>
          <div className="flex items-start justify-between mb-4">
            <h2 className={headingClass}>{scientificName}</h2>
          </div>
          <p className="text-gray-300 text-sm md:text-base mb-6">
            {description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <div className={labelClass}>Found In</div>
              <div className={`mt-1 ${valueClass} flex items-center gap-2`}>
                <FiMapPin className="text-marine-cyan" />
                <span>{locality || 'Unknown locality'}</span>
              </div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <div className={labelClass}>Depth Range</div>
              <div className={`mt-1 ${valueClass}`}>
                {minDepthInMeters ?? '—'}m {typeof minDepthInMeters === 'number' || typeof maxDepthInMeters === 'number' ? ' - ' : ''}
                {maxDepthInMeters ?? '—'}m
              </div>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
              <div className={labelClass}>Basis</div>
              <div className={`mt-1 ${valueClass}`}>{basisOfRecord || '—'}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-white font-semibold mb-2">Interactive Globe</div>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-700/50 sagar-result-globe">
              {globePoints.length > 0 ? (
                <ReactGlobeComponent
                  dataPoints={globePoints}
                  onDataPointClick={() => {}}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No coordinates available</div>
              )}
            </div>
          </div>
        </section>

        {/* Map Card - top-right */}
        <section className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
          </div>
          <div className="aspect-[2/1]">
            {hasCoords ? (
              <WorldMap
                dots={[
                  {
                    start: { lat: coordinates!.lat, lng: coordinates!.lng, label: locality },
                    end: { lat: coordinates!.lat, lng: coordinates!.lng, label: locality },
                  },
                ]}
                lineColor="#0ea5e9"
              />
            ) : (
              <div className="w-full h-full rounded-lg border border-gray-700/50 bg-gray-800/30 flex items-center justify-center text-gray-400">
                No coordinates available
              </div>
            )}
          </div>
        </section>

        {/* Bottom Row Charts - occupy right two columns underneath map on large screens */}
        <section className={`lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Occurrences by Year</h3>
            </div>
            <div className="h-60">
              {years.length > 0 ? (
                <Bar data={occurrencesBarData} options={commonChartOptions} />
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-700/50 bg-gray-800/30 flex items-center justify-center text-gray-400">
                  No data
                </div>
              )}
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Depth Profile</h3>
            </div>
            <div className="h-60">
              {depthSorted.length > 0 ? (
                <Line data={depthLineData} options={commonChartOptions} />
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-700/50 bg-gray-800/30 flex items-center justify-center text-gray-400">
                  No data
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SearchResultsView;


