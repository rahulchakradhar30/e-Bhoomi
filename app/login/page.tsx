'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { OfficerLogin } from '@/components/forms/OfficerLogin';
import { Footer } from '@/components/government/Footer';

export default function LoginPage() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <main className="portal-main-content">
        <section className="simple-login-section">
          <div className="content-container simple-login-container">
            <OfficerLogin />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
