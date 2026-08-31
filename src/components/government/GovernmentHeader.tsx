'use client';

import React from 'react';
import Link from 'next/link';
import { GovernmentLogos } from './GovernmentLogos';

interface GovernmentHeaderProps {
  showPublicNav?: boolean;
}

export const GovernmentHeader: React.FC<GovernmentHeaderProps> = ({ showPublicNav = false }) => {
  return (
    <header className="header-master-wrapper">
      {/* Top Utility Strip */}
      <div className="top-utility-bar">
        <div className="content-container utility-content">
          <div className="goi-flag-text">
            GOVERNMENT OF INDIA • LAND RECORDS MODERNIZATION PORTAL
          </div>
          <div className="utility-right">
            <Link href="/" className="utility-link">
              Home
            </Link>
            <span className="utility-sep">|</span>
            <Link href="/login" className="utility-link">
              Officer Login
            </Link>
            <span className="utility-sep">|</span>
            <Link href="/admin/login" className="utility-link">
              System Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Tricolor Accent Strip */}
      <div className="top-tricolor-bar" />

      {/* Main Branding Strip */}
      <div className="header-container">
        <div className="content-container header-inner">
          <GovernmentLogos />

          {showPublicNav && (
            <div className="nav-actions-group">
              <Link href="/login" className="gov-nav-btn login-btn">
                Officer Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
