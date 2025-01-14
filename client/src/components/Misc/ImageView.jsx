import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const ImageView = ({
  alt,
  src,
  defaultSrc,
  errorSrc,
  height = '100%',
  width = '100%',
  parent = 'images'
}) => {

  console.log('ImageView.jsx: parent:', src);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  // Enhanced image source resolution logic with fallbacks
  const imageSrc = useMemo(() => {
    // Determine which source to use based on fallback logic
    const sourceToUse = src || defaultSrc || errorSrc;

    // If no valid source is available, return null
    if (!sourceToUse) {
      return null;
    }

    // External URLs pass through directly
    if (sourceToUse.startsWith('http://') || sourceToUse.startsWith('https://')) {
      return sourceToUse;
    }

    // Special case mappings
    const specialCases = {
      'authenticator': '/otp.png',
      'astroluma': '/astroluma.svg',
      'link': '/link.png',
      'folder': '/folder.png',
      'todo': '/todo.png',
      'snippet': '/snippet.png',
      'camera': '/cctv.png',
      'device': '/computer.png',
      '/default.png': '/default.png',
      '/astroluma.svg': '/astroluma.svg'
    };

    if (specialCases[sourceToUse]) {
      return specialCases[sourceToUse];
    }

    if (parent) {
      return `${baseUrl}/${parent}/${sourceToUse}`;
    } else {
      return `${baseUrl}/${sourceToUse}`;
    }
  }, [src, defaultSrc, errorSrc, baseUrl, parent]);

  // Initialize with the primary source
  const [currentSrc, setCurrentSrc] = useState(imageSrc);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      console.log(imageSrc);

      if (!imageSrc) {
        return;
      }

      const tryLoadImage = async (source) => {
        if (!source) return false;

        try {
          const img = new Image();
          img.src = source;
          await img.decode();
          return true;
        } catch {
          return false;
        }
      };

      // Try loading the primary source first
      const primarySuccess = await tryLoadImage(imageSrc);
      if (primarySuccess && isMounted) {
        setCurrentSrc(imageSrc);
        return;
      }

      // If primary fails and we have an error source, try that
      if (errorSrc && isMounted && !primarySuccess) {
        const errorSuccess = await tryLoadImage(errorSrc);
        if (errorSuccess) {
          setCurrentSrc(errorSrc);
        } else {
          setCurrentSrc(null);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageSrc, errorSrc]);

  // If no valid source is available, render nothing
  if (!currentSrc) {
    return null;
  }

  return (
    <div style={{ position: 'relative', height, width }}>
      <img
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        src={currentSrc}
        alt={alt}
        onError={() => {
          // Only fall back to error source if we're not already using it
          if (errorSrc && currentSrc !== errorSrc) {
            setCurrentSrc(errorSrc);
          } else {
            setCurrentSrc(null);
          }
        }}
      />
    </div>
  );
};

ImageView.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string,
  defaultSrc: PropTypes.string,
  errorSrc: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  parent: PropTypes.string
};

export default React.memo(ImageView);