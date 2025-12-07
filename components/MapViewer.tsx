import React, { useEffect, useRef } from 'react';
import { LocationRecord } from '../types';

// Access global Leaflet instance
declare global {
  interface Window {
    L: any;
  }
}

interface MapViewerProps {
  locations: LocationRecord[];
}

const MapViewer: React.FC<MapViewerProps> = ({ locations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView([0, 0], 2);
      
      // Dark themed tiles or standard? Standard OSM is easiest without API key.
      // Using CartoDB Dark Matter for better dark mode aesthetic (free/public)
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    // Clear existing layers (except tile layer) by removing all circle markers
    mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.CircleMarker) {
            mapRef.current.removeLayer(layer);
        }
    });

    if (locations.length === 0) return;

    const markers: any[] = [];

    // Use CircleMarkers for a cleaner look that doesn't depend on external image assets
    locations.forEach(loc => {
      const marker = window.L.circleMarker([loc.lat, loc.lng], {
        color: '#06b6d4', // cyan-500
        fillColor: '#22d3ee', // cyan-400
        fillOpacity: 0.7,
        radius: 8,
        weight: 2
      })
      .addTo(mapRef.current)
      .bindPopup(`
        <div class="font-sans">
          <h4 class="font-bold text-sm text-slate-800">${loc.label}</h4>
          <p class="text-xs text-slate-600 mt-1">${new Date(loc.timestamp).toLocaleString()}</p>
          <p class="text-xs text-slate-500 font-mono mt-1">${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}</p>
        </div>
      `);
      markers.push(marker);
    });

    // Create a feature group to fit bounds
    if (markers.length > 0) {
        const group = window.L.featureGroup(markers);
        mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }

  }, [locations]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-850 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
       <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0">
        <h3 className="text-cyan-400 font-semibold tracking-wide flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          GEOLOCATION MAPPING
        </h3>
        <div className="flex items-center gap-2">
           <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">{locations.length} Points</span>
        </div>
      </div>
      <div className="flex-1 relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
         <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
         
         {/* Floating Legend / Info */}
         <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-[400] bg-slate-900/80 backdrop-blur p-2 sm:p-3 rounded border border-slate-700 text-[10px] sm:text-xs text-slate-300 max-w-[200px] sm:max-w-xs">
           <div className="flex items-center gap-2 mb-1">
             <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-500 border border-cyan-300 shrink-0"></span>
             <span>Recorded Location</span>
           </div>
           <p className="opacity-70 mt-1 sm:mt-2 hidden sm:block">Map visualizes GPS coordinates extracted from device metadata and app logs.</p>
         </div>
      </div>
    </div>
  );
};

export default MapViewer;
