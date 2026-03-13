"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VolunteerApplicationsAPI, VolunteerRolesAPI } from '@/lib/api';
import {
  Search,
  Filter,
  User,
  MapPin,
  Calendar,
  ChevronRight,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={12} /> },
  document_review: { label: 'In Review', color: '#5C6ED5', bg: 'rgba(92,110,213,0.1)', icon: <FileText size={12} /> },
  documents_valid: { label: 'Docs Valid', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={12} /> },
  documents_rejected: { label: 'Docs Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={12} /> },
  approved: { label: 'Approved', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={12} /> },
  rejected: { label: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={12} /> },
};

export default function VolunteerApplicationsQueuePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apps, rolesList] = await Promise.all([
        VolunteerApplicationsAPI.list({
          role_id: roleFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
        }),
        VolunteerRolesAPI.list(),
      ]);
      setApplications(apps);
      setRoles(rolesList);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => loadData(), 400);
    return () => clearTimeout(t);
  }, [loadData]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusCounts = Object.keys(STATUS_META).reduce((acc, key) => {
    acc[key] = applications.filter((a) => a.status === key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
              Volunteer Application Queue
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
              Review and process volunteer applications
            </p>
          </div>
          <button
            onClick={loadData}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
              background: 'white', cursor: 'pointer',
              fontSize: '14px', color: 'var(--color-gray-600)',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Status Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {['pending', 'document_review', 'approved'].map((s) => {
            const m = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                style={{
                  padding: '14px 18px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                  background: statusFilter === s ? m.bg : 'white',
                  border: `1px solid ${statusFilter === s ? m.color : 'var(--color-gray-200)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '22px', fontWeight: 700, color: m.color }}>{statusCounts[s] ?? 0}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '2px' }}>{m.label}</div>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by applicant name…"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                fontSize: '14px', outline: 'none', color: 'var(--color-gray-700)',
                background: 'white',
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 14px', borderRadius: '8px',
              border: `1px solid ${showFilters ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              background: showFilters ? 'rgba(92,110,213,0.06)' : 'white',
              color: showFilters ? 'var(--color-primary)' : 'var(--color-gray-600)',
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            <Filter size={14} /> Filter by Role
          </button>

          {(roleFilter || statusFilter) && (
            <button
              onClick={() => { setRoleFilter(''); setStatusFilter(''); }}
              style={{
                padding: '10px 14px', borderRadius: '8px',
                border: '1px solid var(--color-gray-200)', background: 'white',
                color: 'var(--color-gray-500)', cursor: 'pointer', fontSize: '13px',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Role Filter Dropdown */}
        {showFilters && (
          <div className="card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)', alignSelf: 'center', marginRight: '4px' }}>
              Role:
            </span>
            <button
              onClick={() => setRoleFilter('')}
              style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                border: `1px solid ${!roleFilter ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                background: !roleFilter ? 'rgba(92,110,213,0.08)' : 'white',
                color: !roleFilter ? 'var(--color-primary)' : 'var(--color-gray-600)',
              }}
            >
              All Roles
            </button>
            {roles.map((role: any) => (
              <button
                key={role.id}
                onClick={() => setRoleFilter(role.id)}
                style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                  border: `1px solid ${roleFilter === role.id ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                  background: roleFilter === role.id ? 'rgba(92,110,213,0.08)' : 'white',
                  color: roleFilter === role.id ? 'var(--color-primary)' : 'var(--color-gray-600)',
                }}
              >
                {role.title}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '14px' }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {error} — Check backend is running and Supabase keys are configured.
          </div>
        )}

        {/* Application Cards */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
            Loading applications…
          </div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
            No applications found. {search || roleFilter || statusFilter ? 'Try adjusting your filters.' : 'Connect Supabase to load real data.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {applications.map((app: any) => {
              const profile = app.user_profiles;
              const role = app.volunteer_roles;
              const statusMeta = STATUS_META[app.status] ?? STATUS_META.pending;
              return (
                <Link key={app.id} href={`/volunteer-applications/${app.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card"
                    style={{
                      padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow 0.15s',
                      display: 'flex', alignItems: 'center', gap: '16px',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(92,110,213,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
                    }}>
                      <User size={20} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Applicant'}
                        </span>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                          background: statusMeta.bg, color: statusMeta.color,
                        }}>
                          {statusMeta.icon} {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={12} /> {role?.title ?? 'No Role Assigned'}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {role?.location ?? '—'}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> Applied {app.applied_at ? formatDate(app.applied_at) : '—'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={18} color="var(--color-gray-300)" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
