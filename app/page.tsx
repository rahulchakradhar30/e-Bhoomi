'use client';

import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { HeroSearch } from '@/components/ui/HeroSearch';
import { QuickServices } from '@/components/ui/QuickServices';
import { Footer } from '@/components/government/Footer';

export default function HomePage() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={true} />
      <main className="portal-main-content">
        <HeroSearch />
        <QuickServices />
      </main>
      <Footer />
    </div>
  );
}
