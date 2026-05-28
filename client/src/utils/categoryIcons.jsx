import React from 'react';

/**
 * Returns a premium custom SVG icon based on the category slug.
 * This completely avoids Lucide pre-bundling bugs and yields highly curated, premium vector graphics.
 */
export const getCategoryIcon = (slug, size = 24) => {
  switch (slug) {
    case 'pickles':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-svg-icon">
          {/* Premium Jar Icon */}
          <path d="M8 3h8v2H8z" />
          <rect x="5" y="8" width="14" height="13" rx="3" />
          <path d="M8 5v3" />
          <path d="M16 5v3" />
          <line x1="5" y1="12" x2="19" y2="12" strokeDasharray="2 2" />
          {/* Pickle outlines */}
          <path d="M9 14c0 1.5.5 2 1.5 2s1.5-.5 1.5-2" opacity="0.8" />
          <path d="M12 17c0 1.5.5 2 1.5 2s1.5-.5 1.5-2" opacity="0.8" />
        </svg>
      );

    case 'fresh':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-svg-icon">
          {/* Premium Sprout/Leaf Icon */}
          <path d="M12 22V12" />
          <path d="M12 12c0-2.8-2.2-5-5-5H3v2c0 2.8 2.2 5 5 5h4" />
          <path d="M12 14c0-3.3 2.7-6 6-6h3v2c0 3.3-2.7 6-6 6h-3" />
          <path d="M12 8a4 4 0 0 1 4-4h2" />
        </svg>
      );

    case 'frozen':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-svg-icon">
          {/* Premium Detailed Snowflake Icon */}
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="5" y1="19" x2="19" y2="5" />
          {/* Snowflake arms */}
          <path d="M10 4h4" />
          <path d="M10 20h4" />
          <path d="M4 10v4" />
          <path d="M20 10v4" />
          <path d="M5 9l4-4" />
          <path d="M19 15l-4 4" />
          <path d="M5 15l4 4" />
          <path d="M19 9l-4-4" />
        </svg>
      );

    case 'grains':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-svg-icon">
          {/* Premium Wheat Wheat stalk Icon */}
          <path d="M12 22V2" />
          <path d="M12 6c1.5-1.5 3-1.5 3 0s-1.5 2.5-3 3" />
          <path d="M12 6c-1.5-1.5-3-1.5-3 0s1.5 2.5 3 3" />
          <path d="M12 10c1.5-1.5 3-1.5 3 0s-1.5 2.5-3 3" />
          <path d="M12 10c-1.5-1.5-3-1.5-3 0s1.5 2.5 3 3" />
          <path d="M12 14c1.5-1.5 3-1.5 3 0s-1.5 2.5-3 3" />
          <path d="M12 14c-1.5-1.5-3-1.5-3 0s1.5 2.5 3 3" />
          <path d="M12 18c1.5-1.5 3-1.5 3 0s-1.5 2.5-3 3" />
          <path d="M12 18c-1.5-1.5-3-1.5-3 0s1.5 2.5 3 3" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="category-svg-icon">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};
