'use client';

import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  actionText?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  href,
  icon: Icon,
  actionText = 'Access Portal'
}) => {
  return (
    <Link href={href} className="service-card-item">
      <div className="service-icon-wrapper">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="service-card-title">{title}</h3>
      <p className="service-card-desc">{description}</p>
      <span className="service-card-link-text">
        <span>{actionText}</span>
        <span>→</span>
      </span>
    </Link>
  );
};
