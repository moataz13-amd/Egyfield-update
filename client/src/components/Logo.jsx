import React from 'react';
import logoUrl from '../assets/Delta Harvest-8.png';

const Logo = ({ className = '', variant = 'dark' }) => {
  return (
    <img 
      src={logoUrl} 
      alt="Delta Harvest" 
      className={className} 
      style={{ objectFit: 'contain' }}
      decoding="async"
    />
  );
};

export default Logo;
