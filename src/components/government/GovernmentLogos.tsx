'use client';

import React from 'react';
import Link from 'next/link';

interface GovernmentLogosProps {
  className?: string;
}

export const GovernmentLogos: React.FC<GovernmentLogosProps> = ({ className = '' }) => {
  return (
    <Link href="/" className={`header-left-brands ${className}`}>
      <img
        src="/assets/department-of-land-resources.svg"
        alt="Department of Land Resources - Government of India"
        className="brand-logo-img dept-logo"
      />
      <div className="brand-vertical-divider" />
      <img
        src="/assets/ministry-of-rural-development.svg"
        alt="Ministry of Rural Development"
        className="brand-logo-img ministry-logo"
      />
      <div className="brand-vertical-divider" />
      <img
        src="/assets/e-bhoomi-logo.svg"
        alt="e-Bhoomi Land Record Modernization & Digitization System"
        className="brand-logo-img ebhoomi-logo"
      />
    </Link>
  );
};
