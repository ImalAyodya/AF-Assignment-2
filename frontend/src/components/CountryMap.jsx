import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CountryMap = ({ lat, lng, zoom, country, className }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  useEffect(() => {
    if (!lat || !lng) return;
    
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], zoom || 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(mapRef.current);
      
      // Add marker for the country
      L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(country)
        .openPopup();
    } else {
      // Update view if coordinates change
      mapRef.current.setView([lat, lng], zoom || 4);
    }
    
    // Resize the map when component mounts to handle container size issues
    mapRef.current.invalidateSize();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, country]);
  
  return <div ref={mapContainerRef} className={className || 'h-40 w-full rounded-md overflow-hidden'} />;
};

export default CountryMap;