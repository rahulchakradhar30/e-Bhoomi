'use client';

import React from 'react';
import { ServiceCard } from './ServiceCard';
import { FileText, ShieldCheck, Database, Search } from 'lucide-react';

export const QuickServices: React.FC = () => {
  const services = [
    {
      title: 'Field Officer Portal',
      description: 'Submit land records for digitization, verification, and automated AI extraction.',
      href: '/login',
      icon: FileText,
      actionText: 'Officer Sign In'
    },
    {
      title: 'MRO / Tahsildar Portal',
      description: 'Review pending land records, verify field officer submissions, and manage mandal approvals.',
      href: '/login',
      icon: ShieldCheck,
      actionText: 'MRO Workspace'
    },
    {
      title: 'Administrative Portal',
      description: 'District and State level monitoring, cross-jurisdictional audits, and spatial reports.',
      href: '/login',
      icon: Database,
      actionText: 'Admin Log In'
    },
    {
      title: 'System Management',
      description: 'Master data management, officer credentials generation, LGD jurisdiction setup, and security.',
      href: '/admin/login',
      icon: Search,
      actionText: 'System Console'
    }
  ];

  return (
    <section className="quick-services-section">
      <div className="content-container">
        <div className="services-cards-grid">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
};
