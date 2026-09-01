"use client";

import React, { useEffect, useState } from 'react';
import { GovernmentHeader } from '@/components/government/GovernmentHeader';
import { Footer } from '@/components/government/Footer';
import { getPublishedNotifications } from '@/lib/services/notificationService';
import { NotificationDocument } from '@/types/notification';
import { Bell, FileText, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PublicNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<NotificationDocument | null>(null);

  useEffect(() => {
    getPublishedNotifications()
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="ebhoomi-full-portal-layout">
      <GovernmentHeader showPublicNav={true} />
      
      <main className="portal-main-content">
        <div className="content-container" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto' }}>
          
          {selectedNotif ? (
            // Notification Detail View
            <div className="simple-login-card" style={{ padding: '24px', position: 'relative' }}>
              <button 
                onClick={() => setSelectedNotif(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Notifications</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '14px', fontWeight: 600 }}>
                <Calendar className="w-4 h-4" />
                <span>Published: {selectedNotif.publishedAt ? new Date(selectedNotif.publishedAt).toLocaleDateString() : 'N/A'}</span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '12px', lineHeight: 1.3 }}>
                {selectedNotif.title}
              </h1>

              <div 
                style={{ 
                  marginTop: '20px', 
                  color: '#334155', 
                  fontSize: '16px', 
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '20px'
                }}
              >
                {selectedNotif.body}
              </div>

              {selectedNotif.targetJurisdiction && (
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                  <strong>Target Jurisdiction:</strong> {selectedNotif.targetJurisdiction}
                </div>
              )}

              {selectedNotif.status === 'PUBLISHED' && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '30px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <FileText className="w-5 h-5 text-slate-500" />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                      Attachment Reference
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Notification document resource reference structure provisioned.
                    </div>
                  </div>
                  <button 
                    disabled 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#e2e8f0',
                      color: '#94a3b8',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'not-allowed',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <span>View File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Notifications List View
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Bell className="w-6 h-6 text-emerald-600" />
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                  Official State Notifications
                </h1>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div 
                    style={{
                      border: '3px solid #cbd5e1',
                      borderTop: '3px solid #059669',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px auto'
                    }}
                  />
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}} />
                  <span style={{ color: '#64748b' }}>Loading announcements...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div 
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <Bell className="w-10 h-10 text-slate-400" style={{ margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>No notifications available</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                    There are no published revenue administration announcements at this time.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {notifications.map((notif) => (
                    <div 
                      key={notif.notificationId}
                      onClick={() => setSelectedNotif(notif)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16,185,129,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                          {notif.title}
                        </h3>
                        <span 
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {notif.publishedAt ? new Date(notif.publishedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p 
                        style={{
                          color: '#475569',
                          fontSize: '14px',
                          marginTop: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.5
                        }}
                      >
                        {notif.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
