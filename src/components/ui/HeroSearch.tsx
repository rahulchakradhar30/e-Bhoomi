'use client';

import React from 'react';
import { PublicLandSearch } from './PublicLandSearch';

export const HeroSearch: React.FC = () => {
  return (
    <section className="hero-search-section">
      <div className="content-container hero-content-inner">
        <h1 className="hero-title">NATIONAL LAND RECORDS MODERNIZATION PORTAL</h1>
        <div className="hero-subtitle">DIGITAL LAND RECORD INFRASTRUCTURE • GOVERNMENT OF INDIA</div>

        <PublicLandSearch />
      </div>
    </section>
  );
};
