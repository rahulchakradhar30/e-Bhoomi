'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { PasswordChangeForm } from '@/components/forms/PasswordChangeForm';
import { Footer } from '@/components/government/Footer';

export default function PasswordChangePage() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <main className="portal-main-content">
        <section className="simple-login-section">
          <div className="content-container simple-login-container">
            <PasswordChangeForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
