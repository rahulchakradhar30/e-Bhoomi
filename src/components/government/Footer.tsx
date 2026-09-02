'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="content-container">
        <div className="footer-top-row">
          <div>
            <div className="footer-brand-title">e-Bhoomi Modernization Portal</div>
            <div className="footer-brand-org">
              Department of Land Resources (DoLR), Ministry of Rural Development, Government of India.
              National Land Records Modernization Programme (NLRMP) / DILRMP.
            </div>
          </div>
          <ul className="footer-links-list">
            <li className="footer-link-item">
              <Link href="/">Home</Link>
            </li>
            <li className="footer-link-item">
              <Link href="/login">Officer Portal</Link>
            </li>
            <li className="footer-link-item">
              <Link href="/admin/login">System Admin</Link>
            </li>
          </ul>
        </div>

        <div className="footer-divider-line" />

        <div className="footer-bottom-row">
          <div className="footer-copyright-text">
            © {new Date().getFullYear()} Government of India. All Rights Reserved.
          </div>
          <div className="footer-team-attribution">
            <span className="attribution-sih">SIH 2026
              <span className="attribution-sep">|</span>
              <span className="attribution-team">Team <strong>DigitalX</strong></span>
              <span className="attribution-sep">|</span>
              <span className="attribution-members">Rahul Chakradhar | Karthika | Bharath Yuvaraj | Spandana Reddy | Mohaniesh | Ashad </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
