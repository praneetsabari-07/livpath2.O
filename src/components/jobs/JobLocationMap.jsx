import { useState, useEffect } from 'react';

export default function JobLocationMap({ latitude, longitude, location, jobTitle }) {
  const [mapState, setMapState] = useState('loading'); // loading, ready, error

  // The fallback image to use if the iframe fails or as a placeholder
  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCNQqyKviRT2Tw8akT9UhlYdA5PeeWw0bo8cfDcA69-ZjY9Pflf1e1etIMTzsH5s3s6RNngql5bnFagzIkgxnIjodB6G957FyLyBNzlHOYHtihKUvHOPz2AEYRB1NVO_a-CfggSxsNtai3-HmbCx58dWnSz3OQZnUASW2SsuzxlFiOw2g7-y4AlM7-kHcJmOrzAscCGC8LtfkFkGOhJRkigAjz9bQnrqJdOvkjMXUNWnaSm_Ayc9t9hqg";

  useEffect(() => {
    // Artificial loading state for skeleton demonstration
    const timer = setTimeout(() => {
      // In a real app, we might check if the provider is available here.
      // For this prototype, we'll try to load the iframe.
      setMapState('ready');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeError = () => {
    setMapState('error');
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 h-[250px] w-full bg-surface-container">
      {mapState === 'loading' && (
        <div className="absolute inset-0 bg-surface-container animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-outline text-4xl animate-bounce">location_on</span>
        </div>
      )}

      {mapState === 'ready' && latitude && longitude && (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onError={handleIframeError}
          onLoad={() => setMapState('ready')}
        ></iframe>
      )}

      {(mapState === 'error' || (!latitude && !longitude && mapState !== 'loading')) && (
        <img
          alt={`Map showing job location for ${jobTitle} in ${location}`}
          className="w-full h-full object-cover block"
          src={fallbackImage}
        />
      )}

      {/* Location overlay chip */}
      <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-glass-stroke z-10 pointer-events-none">
        <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        <span className="font-label-sm text-primary">{location}</span>
      </div>
    </div>
  );
}
