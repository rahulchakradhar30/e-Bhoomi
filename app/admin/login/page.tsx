'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { AdminLogin } from '@/components/forms/AdminLogin';
import { Footer } from '@/components/government/Footer';

export default function AdminLoginPage() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <main className="portal-main-content admin-login-bg">
        <section className="simple-login-section">
          <div className="content-container simple-login-container">
            <AdminLogin />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
