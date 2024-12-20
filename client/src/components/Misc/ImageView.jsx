import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ImageView = ({ alt, src, defaultSrc, errorSrc, height, width, parent = "images" }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const imageSrc = src === 'authenticator' ? '/otp.png' : src === 'astroluma' ? '/astroluma.svg' : `${baseUrl}/${parent}/${src}`;
  const [currentSrc, setCurrentSrc] = useState(defaultSrc);

  useEffect(() => {
    setCurrentSrc(defaultSrc);
  }, [imageSrc, defaultSrc]);

  useEffect(() => {
    const handleLoad = () => {
      const img = new Image();
      img.src = imageSrc;
      img.decode()
        .then(() => setCurrentSrc(imageSrc))
        .catch(() => setCurrentSrc(errorSrc));
    };

    handleLoad();
  }, [imageSrc, errorSrc]); // Added errorSrc to dependencies since it's used in handleLoad

  return (
    <div style={{ position: 'relative', height, width }}>
      {/* deepsource-ignore JS-0760 */}
      <img
        style={{ width: '100%', height: '100%' }}
        src={currentSrc}
        alt={alt}
        onError={() => setCurrentSrc(errorSrc)}
      />
    </div>
  );
};

ImageView.propTypes = {
  alt: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  defaultSrc: PropTypes.string.isRequired,
  errorSrc: PropTypes.string.isRequired,
  height: PropTypes.string,
  width: PropTypes.string,
  parent: PropTypes.string
};

const MemoizedComponent = React.memo(ImageView);
export default MemoizedComponent;