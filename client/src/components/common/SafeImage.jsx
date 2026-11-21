import React, { useState } from 'react';

const FALLBACK_IMAGES = {
  tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800',
  cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800',
  badminton: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=800',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
  padel: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  default: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800'
};

export const SafeImage = ({
  src,
  alt = 'KHELORA Sports Facility',
  className = '',
  category = 'default',
  fallbackSrc = null,
  ...props
}) => {
  const chosenFallback = fallbackSrc || FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  const [currentSrc, setCurrentSrc] = useState(src || chosenFallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(chosenFallback);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default SafeImage;
