"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Play, 
  AlertCircle, 
  MapPin, 
  Users, 
  Radio, 
  Clock,
  Target,
  HeartPulse,
  Truck,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { MissionsAPI } from '@/lib/api';

export default function ActivateMissionPage() {
  const [missionType, setMissionType] = useState('medic');
  const [urgencyLevel, setUrgencyLevel] = useState('high');
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    MissionsAPI.volunteerSummary()
      .then((data: any) => setSummaryData(data))
      .catch(() => {});
  }, []);

  // Updated to just 3 roles: Medic, Logistics, Field
  const missionTypes = [
    { id: 'medic', label: 'Medic Role', icon: <HeartPulse size={18} />, description: 'Medical support, triage, and emergency care' },
    { id: 'logistics', label: 'Logistics Role', icon: <Truck size={18} />, description: 'Supply delivery, transport, and coordination' },
    { id: 'field', label: 'Field Role', icon: <Target size={18} />, description: 'Search, rescue, and field operations' },
  ];

  const urgencyOptions = [
    { id: 'critical', label: 'Critical', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { id: 'high', label: 'High', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'medium', label: 'Medium', color: '#5C6ED5', bg: 'rgba(92, 110, 213, 0.1)' },
    { id: 'low', label: 'Low', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  ];

  return (
    <DashboardLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        {/* Hero Section with Background Image - Simplified */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '360px',
          borderRadius: '20px',
          overflow: 'hidden',
          marginTop: '8px',  // Small top margin instead of breadcrumb
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}>
          {/* Background Image with Fade Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}>
            <Image
              src="/images/mission_pic.jpg"
              alt="Mission Background"
              fill
              style={{
                objectFit: 'cover'
              }}
              priority
            />
            {/* Dark Gradient Overlay for Better Text Visibility */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
              zIndex: 2
            }} />
          </div>

          {/* Centered Content Overlay */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '56px',
              fontWeight: 700,
              marginBottom: '16px',
              lineHeight: 1.2,
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
              letterSpacing: '-0.02em'
            }}>
              Activate Your Mission Now
            </h1>
            
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              marginBottom: '32px',
              opacity: 0.95,
              maxWidth: '800px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Command real-time disaster response from a single interface. 
              Coordinate teams, allocate resources, and save lives when every second counts.
            </p>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <button style={{
                backgroundColor: '#5C6ED5',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 40px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(92, 110, 213, 0.4)',
                transition: 'all 0.2s'
              }}>
                <Play size={20} />
                Activate Now
              </button>
              
              <button style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '50px',
                padding: '14px 40px',
                fontSize: '18px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}>
                Learn More
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section - Moved right after hero */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginTop: '8px',
          marginBottom: '24px'
        }}>
          <div className="card" style={{
            padding: '24px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>Available Volunteers</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{summaryData?.summary.total ?? '—'}</div>
          </div>
          <div className="card" style={{
            padding: '24px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>Active Missions</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{summaryData?.summary.active ?? '—'}</div>
          </div>
          <div className="card" style={{
            padding: '24px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>Teams on Standby</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{summaryData ? Object.keys(summaryData.by_role).length : '—'}</div>
          </div>
          <div className="card" style={{
            padding: '24px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>Equipment Ready</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>—</div>
          </div>
        </div>

        {/* Mission Configuration Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          width: '100%'
        }}>
          {/* Left Column - Mission Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Mission Type Selection - Now with 3 roles */}
            <div className="card" style={{
              padding: '28px',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Target size={20} color="#5C6ED5" />
                Select Mission Role
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                {missionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMissionType(type.id)}
                    style={{
                      padding: '24px 16px',
                      backgroundColor: missionType === type.id ? 'rgba(92, 110, 213, 0.1)' : '#F9FAFB',
                      border: missionType === type.id ? '2px solid #5C6ED5' : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      color: missionType === type.id ? '#5C6ED5' : '#374151'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '48px',
                        backgroundColor: missionType === type.id ? 'rgba(92, 110, 213, 0.2)' : 'rgba(107, 114, 128, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {type.icon}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>{type.label}</span>
                      <span style={{
                        fontSize: '12px',
                        color: missionType === type.id ? '#5C6ED5' : '#6B7280',
                        lineHeight: 1.4
                      }}>
                        {type.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Details Form */}
            <div className="card" style={{
              padding: '28px',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={20} color="#5C6ED5" />
                Mission Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Mission Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Mission Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., North District Evacuation"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#F9FAFB'
                    }}
                  />
                </div>

                {/* Location and Zone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Location
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#F9FAFB'
                    }}>
                      <option>Downtown District</option>
                      <option>North District</option>
                      <option>East District</option>
                      <option>South District</option>
                      <option>West District</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Zone
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#F9FAFB'
                    }}>
                      <option>Zone A</option>
                      <option>Zone B</option>
                      <option>Zone C</option>
                      <option>Zone D</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Mission Description
                  </label>
                  <textarea
                    placeholder="Describe the mission objectives and requirements..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#F9FAFB',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Time and Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '15px',
                        color: '#111827',
                        outline: 'none',
                        backgroundColor: '#F9FAFB'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Estimated Duration
                    </label>
                    <select style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '15px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#F9FAFB'
                    }}>
                      <option>2 hours</option>
                      <option>4 hours</option>
                      <option>8 hours</option>
                      <option>12 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Resource Allocation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Urgency Level */}
            <div className="card" style={{
              padding: '28px',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={20} color="#5C6ED5" />
                Urgency Level
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {urgencyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setUrgencyLevel(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 18px',
                      backgroundColor: urgencyLevel === option.id ? option.bg : '#F9FAFB',
                      border: urgencyLevel === option.id ? `1px solid ${option.color}` : '1px solid #E5E7EB',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: option.color
                      }} />
                      <span style={{
                        fontSize: '16px',
                        fontWeight: urgencyLevel === option.id ? 600 : 500,
                        color: urgencyLevel === option.id ? option.color : '#374151'
                      }}>
                        {option.label}
                      </span>
                    </div>
                    {urgencyLevel === option.id && (
                      <span style={{ color: option.color, fontSize: '14px' }}>Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Allocation */}
            <div className="card" style={{
              padding: '28px',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Users size={20} color="#5C6ED5" />
                Resource Allocation
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Volunteers */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Volunteers Needed</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>8</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    defaultValue="8"
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: 'linear-gradient(90deg, #5C6ED5 40%, #E5E7EB 40%)',
                      WebkitAppearance: 'none',
                      outline: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#9CA3AF'
                  }}>
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Teams Selection - Updated to match the 3 roles */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '10px'
                  }}>
                    Assign Teams
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Medic Team', 'Logistics Team', 'Field Team'].map((team) => (
                      <label key={team} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer'
                      }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#5C6ED5' }} />
                        <span style={{ fontSize: '15px', color: '#374151' }}>{team}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Equipment Required
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    backgroundColor: '#F9FAFB'
                  }}>
                    <option>Standard Response Kit</option>
                    <option>Medical Equipment Package</option>
                    <option>Search & Rescue Gear</option>
                    <option>Communication Setup</option>
                    <option>Heavy Equipment</option>
                  </select>
                </div>

                {/* Communication Channel */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    <Radio size={14} color="#5C6ED5" style={{ marginRight: '6px' }} />
                    Communication Channel
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    backgroundColor: '#F9FAFB'
                  }}>
                    <option>Channel 1 (Primary)</option>
                    <option>Channel 2 (Secondary)</option>
                    <option>Channel 3 (Emergency)</option>
                    <option>Channel 4 (Reserve)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{
                backgroundColor: '#5C6ED5',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                padding: '18px',
                fontSize: '17px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(92, 110, 213, 0.3)',
                transition: 'all 0.2s'
              }}>
                <Play size={20} />
                Activate Mission
              </button>
              
              <Link href="/" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '40px',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}>
                  Cancel
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}