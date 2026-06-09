import React from 'react';
import logoUrl from '../assets/egyfield.svg';

const Logo = ({ className = '', variant = 'dark' }) => {
  return (
    <img 
      src={logoUrl} 
      alt="EgyField" 
      className={className} 
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;
