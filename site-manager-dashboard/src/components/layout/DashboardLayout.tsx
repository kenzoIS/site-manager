import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  
  // Determine the middle text based on the current path
  const getMiddleText = () => {
    if (pathname === '/volunteer-summary') {
      return 'Volunteer Command';
    } else if (pathname === '/') {
      return 'Site Manager Dashboard';
    } else if (pathname === '/activate-mission') {
      return ''; // Blank for activate-mission page
    }
    return 'Site Manager Dashboard'; // Default
  };

  const middleText = getMiddleText();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-gray-50)'
    }}>
      {/* Header - Full Width with Logo and Navigation */}
      <header style={{ 
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: '12px 40px',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left - Logo that navigates to home */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                position: 'relative',
                flexShrink: 0
              }}>
                <Image
                  src="/images/bayanihub_logo.png"
                  alt="Bayanihub Logo"
                  fill
                  style={{
                    objectFit: 'contain'
                  }}
                  priority
                />
              </div>
              <span style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#5C6ED5',
                letterSpacing: '-0.02em'
              }}>
                BayaniHub
              </span>
            </div>
          </Link>

          {/* Center - Dynamic Page Title */}
          {middleText && (
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '18px',
              fontWeight: 500,
              color: '#374151',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }}>
              {middleText}
            </div>
          )}

          {/* Right - Notification and Profile Icons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Notification Icon */}
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 0.2s'
            }}>
              <Bell size={20} />
              {/* Notification Badge */}
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#EF4444',
                borderRadius: '50%',
                border: '2px solid white'
              }}></span>
            </button>

            {/* Profile Icon */}
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 0.2s'
            }}>
              <User size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ 
        padding: '32px 40px',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};