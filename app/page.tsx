
import React from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { HeroSearch } from '@/components/ui/HeroSearch';
import { Footer } from '@/components/government/Footer';

export default function HomePage() {
  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={false} />
      <main className="portal-main-content">
        <HeroSearch />
      </main>
      <Footer />
    </div>
  );
}
