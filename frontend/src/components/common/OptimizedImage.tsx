import React, { useState } from 'react';
import './OptimizedImage.scss';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  // Shown instead of the default "Image unavailable" box if the image fails to load.
  fallback?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className = '', fallback }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`optimized-image-container ${className}`}>
      {!isLoaded && (
        <div className="image-skeleton" />
      )}
      {hasError ? (
        fallback ?? (
          <div className="image-error">
            <span>Image unavailable</span>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'loaded' : ''}`}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
