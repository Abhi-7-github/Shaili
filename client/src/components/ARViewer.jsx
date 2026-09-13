import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

const ARViewer = () => {
  const modelViewerRef = useRef(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log('[ARViewer] 3D Model loaded successfully');
      setIsLoaded(true);
      setLoadError(false);
    };

    const handleError = (event) => {
      console.error('[ARViewer] Failed to load 3D model:', event);
      setLoadError(true);
      setIsLoaded(false);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '60vh', background: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative' }}>
      <model-viewer
        ref={modelViewerRef}
        src="/models/polo.glb"
        alt="A 3D model of a polo shirt"
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
      >
        <button slot="ar-button" style={{
          backgroundColor: '#ff3366',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '24px',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          View in your space
        </button>
      </model-viewer>
      {loadError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#d32f2f',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          maxWidth: '80%'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Unable to display 3D Model</p>
          <p style={{ fontSize: '0.875rem', color: '#555' }}>
            The 3D model file (<code>polo.glb</code>) is invalid or corrupted. Please check the GLB file.
          </p>
        </div>
      )}
    </div>
  );
};

export default ARViewer;