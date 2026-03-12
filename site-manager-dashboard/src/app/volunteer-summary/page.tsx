"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  Users, 
  Activity, 
  MapPin, 
  Radio, 
  Clock, 
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  Truck,
  HeartPulse,
  UserCheck,
  UserCog,
  Circle,
  PieChart,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';

export default function VolunteerSummaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Refs for dropdown click outside handling
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  // Team distribution data for pie chart - with more distinct colors
  const teamDistribution = [
    { name: 'Medic Team', value: 42, percentage: 31.1, color: '#5C6ED5' }, // Bright blue
    { name: 'Logistics', value: 38, percentage: 28.1, color: '#F59E0B' }, // Amber
    { name: 'Field Ops', value: 47, percentage: 34.8, color: '#10B981' }, // Emerald green
  ];

  // Calculate total for pie chart
  const totalVolunteers = teamDistribution.reduce((sum, team) => sum + team.value, 0);

  // Calculate pie chart segments
  let cumulativeAngle = 0;
  const pieSegments = teamDistribution.map(team => {
    const angle = (team.value / totalVolunteers) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    
    // Convert to radians for SVG calculations
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      ...team,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    };
  });

  // Volunteer data
  const volunteers = [
    {
      id: 'VL001',
      name: 'Dr. Sarah Johnson',
      initials: 'SJ',
      team: 'Medic Alpha',
      teamCategory: 'Medic Team',
      location: 'Downtown Medical Center',
      capabilities: ['Emergency Surgery', 'Trauma Care'],
      status: 'Active',
      avatar: null
    },
    {
      id: 'VL002',
      name: 'Mike Chen',
      initials: 'MC',
      team: 'Logistics Bravo',
      teamCategory: 'Logistics',
      location: 'Supply Distribution Hub',
      capabilities: ['Heavy Vehicle', 'Warehouse Mgmt'],
      status: 'Active',
      avatar: null
    },
    {
      id: 'VL003',
      name: 'Emily Rodriguez',
      initials: 'ER',
      team: 'Field Charlie',
      teamCategory: 'Field Ops',
      location: 'Riverside Evacuation Zone',
      capabilities: ['Search & Rescue', 'Navigation'],
      status: 'Active',
      avatar: null
    },
    {
      id: 'VL004',
      name: 'James Wilson',
      initials: 'JW',
      team: 'Medic Alpha',
      teamCategory: 'Medic Team',
      location: 'Downtown Medical Center',
      capabilities: ['Paramedic', 'First Aid'],
      status: 'Break',
      avatar: null
    },
    {
      id: 'VL005',
      name: 'Lisa Wong',
      initials: 'LW',
      team: 'Logistics Alpha',
      teamCategory: 'Logistics',
      location: 'Supply Distribution Hub',
      capabilities: ['Inventory Mgmt', 'Coordination'],
      status: 'Standby',
      avatar: null
    },
    {
      id: 'VL006',
      name: 'Robert Chen',
      initials: 'RC',
      team: 'Field Delta',
      teamCategory: 'Field Ops',
      location: 'North Evacuation Zone',
      capabilities: ['Rescue', 'First Aid'],
      status: 'Active',
      avatar: null
    }
  ];

  // Get unique teams and statuses for filters
  const uniqueTeams = [...new Set(volunteers.map(v => v.teamCategory))];
  const uniqueStatuses = [...new Set(volunteers.map(v => v.status))];

  // Filter volunteers based on search term and filters
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(volunteer => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Team filter
      const matchesTeam = selectedTeams.length === 0 || selectedTeams.includes(volunteer.teamCategory);
      
      // Status filter
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(volunteer.status);
      
      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [searchTerm, selectedTeams, selectedStatuses]);

  // Toggle team selection
  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };

  // Toggle status selection
  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTeams([]);
    setSelectedStatuses([]);
    setSearchTerm('');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setShowTeamDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#0B7B4A', border: '#10B981' };
      case 'Break': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#B45309', border: '#F59E0B' };
      case 'Standby': return { bg: 'rgba(107, 114, 128, 0.15)', text: '#4B5563', border: '#6B7280' };
      default: return { bg: 'rgba(92, 110, 213, 0.15)', text: '#3E5A99', border: '#5C6ED5' };
    }
  };

  const getTeamIcon = (team: string) => {
    switch(team) {
      case 'Medic Team': return <HeartPulse size={14} color="#5C6ED5" />;
      case 'Logistics': return <Truck size={14} color="#F59E0B" />;
      case 'Field Ops': return <MapPin size={14} color="#10B981" />;
      default: return null;
    }
  };

  const getTeamColor = (team: string) => {
    switch(team) {
      case 'Medic Team': return '#5C6ED5';
      case 'Logistics': return '#F59E0B';
      case 'Field Ops': return '#10B981';
      default: return '#6B7280';
    }
  };

  const totalFilters = selectedTeams.length + selectedStatuses.length;

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto'
      }}>
        
        {/* Header Section - No Breadcrumb */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',  // Small top margin instead of breadcrumb
          marginBottom: '4px'
        }}>
          <div>
            <h1 style={{
              fontSize: '35px',
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Activity size={32} color="#5C6ED5" />
              Volunteer Command
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock size={14} color="#9CA3AF" />
              Live Updates · Last updated: <span style={{ fontWeight: 500, color: '#374151' }}>2 min ago</span>
            </p>
          </div>

          {/* Live Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(92, 110, 213, 0.1)',
            padding: '8px 16px',
            borderRadius: '40px',
            border: '1px solid rgba(92, 110, 213, 0.2)'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#5C6ED5',
              animation: 'pulse 2s infinite'
            }}></span>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#5C6ED5'
            }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Stats Cards - Smaller and More Subtle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%'
        }}>
          {/* Total Active Card - Smaller */}
          <div className="card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(92, 110, 213, 0.1) 0%, rgba(62, 90, 153, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={20} color="#5C6ED5" />
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: 500,
                marginBottom: '2px',
                letterSpacing: '0.02em'
              }}>
                TOTAL ACTIVE
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1,
                marginBottom: '2px'
              }}>
                127
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#0B7B4A',
                fontWeight: 500
              }}>
                <TrendingUp size={12} />
                +12 from yesterday
              </div>
            </div>
          </div>

          {/* Medic Team Card - Smaller */}
          <div className="card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(92, 110, 213, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HeartPulse size={20} color="#5C6ED5" />
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: 500,
                marginBottom: '2px',
                letterSpacing: '0.02em'
              }}>
                MEDIC TEAM
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1,
                marginBottom: '2px'
              }}>
                42
              </div>
              <div style={{
                fontSize: '11px',
                color: '#4B5563',
                fontWeight: 500
              }}>
                <span style={{ color: '#0B7B4A', fontWeight: 600 }}>18</span> on field, <span style={{ color: '#6B7280' }}>24</span> standby
              </div>
            </div>
          </div>

          {/* Logistics Card - Smaller */}
          <div className="card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: 500,
                marginBottom: '2px',
                letterSpacing: '0.02em'
              }}>
                LOGISTICS
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1,
                marginBottom: '2px'
              }}>
                38
              </div>
              <div style={{
                fontSize: '11px',
                color: '#4B5563',
                fontWeight: 500
              }}>
                <span style={{ color: '#0B7B4A', fontWeight: 600 }}>15</span> transport, <span style={{ color: '#6B7280' }}>23</span> supply
              </div>
            </div>
          </div>

          {/* Field Ops Card - Smaller */}
          <div className="card" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={20} color="#10B981" />
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: 500,
                marginBottom: '2px',
                letterSpacing: '0.02em'
              }}>
                FIELD OPS
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#111827',
                lineHeight: 1,
                marginBottom: '2px'
              }}>
                47
              </div>
              <div style={{
                fontSize: '11px',
                color: '#4B5563',
                fontWeight: 500
              }}>
                <span style={{ color: '#0B7B4A', fontWeight: 600 }}>32</span> deployed, <span style={{ color: '#6B7280' }}>15</span> backup
              </div>
            </div>
          </div>
        </div>

        {/* Active Teams and Team Distribution Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          width: '100%'
        }}>
          {/* Active Teams Section */}
          <div className="card" style={{
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #F3F4F6',
              paddingBottom: '12px'
            }}>
              <UserCheck size={20} color="#5C6ED5" />
              Active Teams
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Medic Alpha */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(92, 110, 213, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <HeartPulse size={24} color="#5C6ED5" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>Medic Alpha</div>
                    <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#9CA3AF" />
                      Downtown Medical Center
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0B7B4A',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    6 members
                  </div>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-block',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                  }}></span>
                </div>
              </div>

              {/* Logistics Bravo */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Truck size={24} color="#F59E0B" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>Logistics Bravo</div>
                    <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#9CA3AF" />
                      Supply Distribution Hub
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0B7B4A',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    8 members
                  </div>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-block',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                  }}></span>
                </div>
              </div>

              {/* Field Charlie */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#F9FAFB',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MapPin size={24} color="#10B981" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827', marginBottom: '6px' }}>Field Charlie</div>
                    <div style={{ fontSize: '13px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#9CA3AF" />
                      Riverside Evacuation Zone
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 14px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0B7B4A',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    12 members
                  </div>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    display: 'inline-block',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
                  }}></span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Distribution Section with Pie Chart */}
          <div className="card" style={{
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #F3F4F6',
              paddingBottom: '12px'
            }}>
              <PieChart size={20} color="#5C6ED5" />
              Team Distribution
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '20px'
            }}>
              {/* Pie Chart SVG */}
              <div style={{
                width: '140px',
                height: '140px',
                position: 'relative',
                flexShrink: 0
              }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {pieSegments.map((segment, index) => (
                    <path
                      key={index}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                  <circle cx="50" cy="50" r="25" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{totalVolunteers}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>Total</div>
                </div>
              </div>

              {/* Simple Legend */}
              <div style={{ flex: 1 }}>
                {teamDistribution.map((team, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '8px 0',
                    borderBottom: index < teamDistribution.length - 1 ? '1px dashed #E5E7EB' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        backgroundColor: team.color
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{team.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{team.value}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>({team.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Stats Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '16px 0 8px',
              borderTop: '1px solid #F3F4F6'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#5C6ED5' }}>42</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Medic</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>38</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Logistics</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981' }}>47</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Field Ops</div>
              </div>
            </div>
          </div>
        </div>

        {/* Volunteer Details Table */}
        <div className="card" style={{
          padding: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: '16px'
        }}>
          {/* Table Header with Title and Filters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #F3F4F6',
            paddingBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Users size={20} color="#5C6ED5" />
              Volunteer Details
              {filteredVolunteers.length > 0 && (
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#6B7280',
                  marginLeft: '8px'
                }}>
                  ({filteredVolunteers.length} {filteredVolunteers.length === 1 ? 'volunteer' : 'volunteers'})
                </span>
              )}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#F9FAFB',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}>
                <Search size={16} color="#9CA3AF" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    width: '200px',
                    color: '#111827'
                  }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={14} color="#9CA3AF" />
                  </button>
                )}
              </div>

              {/* Team Filter Dropdown */}
              <div ref={teamDropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => {
                    setShowTeamDropdown(!showTeamDropdown);
                    setShowStatusDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: selectedTeams.length > 0 ? 'rgba(92, 110, 213, 0.1)' : '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: selectedTeams.length > 0 ? '#5C6ED5' : '#374151',
                    cursor: 'pointer'
                  }}
                >
                  <Filter size={14} color={selectedTeams.length > 0 ? '#5C6ED5' : '#6B7280'} />
                  Team
                  {selectedTeams.length > 0 && (
                    <span style={{
                      backgroundColor: '#5C6ED5',
                      color: 'white',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginLeft: '4px'
                    }}>
                      {selectedTeams.length}
                    </span>
                  )}
                  <ChevronDown size={14} color="#6B7280" />
                </button>
                
                {showTeamDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    width: '200px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #F3F4F6',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}>
                      Filter by Team
                    </div>
                    {uniqueTeams.map(team => (
                      <div
                        key={team}
                        onClick={() => toggleTeam(team)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedTeams.includes(team) ? 'rgba(92, 110, 213, 0.05)' : 'white',
                          borderBottom: '1px solid #F9FAFB',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTeams.includes(team) ? 'rgba(92, 110, 213, 0.05)' : 'white'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            backgroundColor: getTeamColor(team)
                          }} />
                          <span style={{ fontSize: '14px', color: '#374151' }}>{team}</span>
                        </div>
                        {selectedTeams.includes(team) && (
                          <Check size={14} color="#5C6ED5" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowTeamDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: selectedStatuses.length > 0 ? 'rgba(92, 110, 213, 0.1)' : '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: selectedStatuses.length > 0 ? '#5C6ED5' : '#374151',
                    cursor: 'pointer'
                  }}
                >
                  <Filter size={14} color={selectedStatuses.length > 0 ? '#5C6ED5' : '#6B7280'} />
                  Status
                  {selectedStatuses.length > 0 && (
                    <span style={{
                      backgroundColor: '#5C6ED5',
                      color: 'white',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      marginLeft: '4px'
                    }}>
                      {selectedStatuses.length}
                    </span>
                  )}
                  <ChevronDown size={14} color="#6B7280" />
                </button>
                
                {showStatusDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    width: '180px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #F3F4F6',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}>
                      Filter by Status
                    </div>
                    {uniqueStatuses.map(status => {
                      const statusColor = getStatusColor(status);
                      return (
                        <div
                          key={status}
                          onClick={() => toggleStatus(status)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            backgroundColor: selectedStatuses.includes(status) ? 'rgba(92, 110, 213, 0.05)' : 'white',
                            borderBottom: '1px solid #F9FAFB',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedStatuses.includes(status) ? 'rgba(92, 110, 213, 0.05)' : 'white'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: statusColor.border
                            }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>{status}</span>
                          </div>
                          {selectedStatuses.includes(status) && (
                            <Check size={14} color="#5C6ED5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Clear Filters - shown only when filters are active */}
              {totalFilters > 0 && (
                <button 
                  onClick={clearFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#6B7280',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedTeams.length > 0 || selectedStatuses.length > 0) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>Active filters:</span>
              {selectedTeams.map(team => (
                <span key={team} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(92, 110, 213, 0.1)',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#5C6ED5',
                  border: '1px solid rgba(92, 110, 213, 0.2)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: getTeamColor(team)
                  }} />
                  {team}
                  <button onClick={() => toggleTeam(team)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', display: 'flex' }}>
                    <X size={10} color="#5C6ED5" />
                  </button>
                </span>
              ))}
              {selectedStatuses.map(status => (
                <span key={status} style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(92, 110, 213, 0.1)',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#5C6ED5',
                  border: '1px solid rgba(92, 110, 213, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status).border,
                    display: 'inline-block'
                  }} />
                  {status}
                  <button onClick={() => toggleStatus(status)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', display: 'flex' }}>
                    <X size={10} color="#5C6ED5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search result indicator */}
          {searchTerm && (
            <div style={{
              marginBottom: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(92, 110, 213, 0.08)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#374151',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Showing results for: <span style={{ fontWeight: 600, color: '#5C6ED5' }}>"{searchTerm}"</span>
                <span style={{ marginLeft: '8px', color: '#6B7280' }}>({filteredVolunteers.length} found)</span>
              </span>
              <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} color="#9CA3AF" />
              </button>
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid #E5E7EB',
                  color: '#6B7280',
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Volunteer</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Team</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Capabilities</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((volunteer, index) => {
                  const statusColor = getStatusColor(volunteer.status);
                  return (
                    <tr key={index} style={{
                      borderBottom: index < filteredVolunteers.length - 1 ? '1px solid #F3F4F6' : 'none'
                    }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #5C6ED5 0%, #3E5A99 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: 600,
                            boxShadow: '0 4px 8px rgba(92, 110, 213, 0.3)'
                          }}>
                            {volunteer.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827', marginBottom: '4px' }}>{volunteer.name}</div>
                            <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Circle size={6} color="#9CA3AF" fill="#9CA3AF" />
                              ID: {volunteer.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          backgroundColor: '#F9FAFB',
                          padding: '6px 12px',
                          borderRadius: '30px',
                          width: 'fit-content',
                          border: '1px solid #F3F4F6'
                        }}>
                          {volunteer.teamCategory === 'Medic Team' && <HeartPulse size={14} color="#5C6ED5" />}
                          {volunteer.teamCategory === 'Logistics' && <Truck size={14} color="#F59E0B" />}
                          {volunteer.teamCategory === 'Field Ops' && <MapPin size={14} color="#10B981" />}
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{volunteer.team}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#374151', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#9CA3AF" />
                          {volunteer.location}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {volunteer.capabilities.map((cap, i) => (
                            <span key={i} style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(92, 110, 213, 0.1)',
                              borderRadius: '30px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#3E5A99',
                              border: '1px solid rgba(92, 110, 213, 0.2)'
                            }}>
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          padding: '6px 14px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '30px',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: `1px solid ${statusColor.border}`,
                          display: 'inline-block'
                        }}>
                          {volunteer.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          padding: '4px'
                        }}>
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* No results message */}
          {filteredVolunteers.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              No volunteers found matching your criteria
            </div>
          )}
        </div>

        {/* Add animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}