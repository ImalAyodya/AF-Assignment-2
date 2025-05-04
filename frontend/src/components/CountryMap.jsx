import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useInView } from 'react-intersection-observer';

const CountryMap = ({ lat, lng, country, className, zoom }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const defaultZoom = 4;
  
  useEffect(() => {
    // Ensure Leaflet is available in browser environment
    if (typeof window === 'undefined' || !L) return;

    // Create a resize observer to handle map resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }
    
    if (!mapRef.current) {
      // Short timeout to ensure container is properly sized
      const timer = setTimeout(() => {
        mapRef.current = L.map(mapContainerRef.current).setView(
          [lat, lng], 
          zoom || defaultZoom
        );
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(mapRef.current);
        
        // Add marker for the country
        L.marker([lat, lng])
          .addTo(mapRef.current)
          .bindPopup(country)
          .openPopup();
          
        setMapInitialized(true);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    } else {
      // Update view if coordinates change
      mapRef.current.setView([lat, lng], zoom || defaultZoom);
      
      // Resize the map when component updates
      mapRef.current.invalidateSize();
    }
    
    return () => {
      resizeObserver.disconnect();
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, zoom, country, defaultZoom]);
  
  // Set a default map container class if none provided
  const mapContainerClass = className || 'h-40 w-full rounded-md overflow-hidden';
  
  return (
    <div className="map-wrapper">
      <div 
        ref={mapContainerRef} 
        className={mapContainerClass}
        style={{ minHeight: '150px' }}
      />
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Fix the MapWrapper component to handle missing coordinates
const MapWrapper = ({ country }) => {
  const [mapRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Check if country and latlng are defined before trying to access them
  if (!country || !country.latlng || !Array.isArray(country.latlng) || country.latlng.length < 2) {
    return (
      <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p>Map coordinates not available</p>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="mt-3 rounded-lg overflow-hidden">
      {inView && (
        <CountryMap 
          lat={country.latlng[0]} 
          lng={country.latlng[1]} 
          country={country.name.common}
          className="h-24 sm:h-32 w-full rounded-md overflow-hidden"
        />
      )}
    </div>
  );
};

export default CountryMap;