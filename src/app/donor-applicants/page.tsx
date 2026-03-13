"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserProfilesAPI } from '@/lib/api';
import {
  Search,
  User,
  Heart,
  MapPin,
  Phone,
  Calendar,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Donor {
  donor_auth_id: string;
  user_profiles: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    barangay: string;
    municipality: string;
    province: string;
    profile_photo_key: string | null;
    role: string;
    created_at: string;
  } | null;
  amount: number;
  currency: string;
  payment_method: string;
  donated_at: string;
  status: string;
}

export default function DonorApplicantsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UserProfilesAPI.donors();
      setDonors(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonors();
  }, [loadDonors]);

  const filtered = donors.filter((d) => {
    if (!search) return true;
    const p = d.user_profiles;
    if (!p) return false;
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || p.municipality?.toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: currency ?? 'PHP' }).format(amount);

  const roleColor: Record<string, string> = {
    donor: '#5C6ED5',
    verified_volunteer: '#10B981',
    volunteer: '#F59E0B',
    site_manager: '#EF4444',
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
              Donor Applicant List
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
              All registered donors and their contribution history
            </p>
          </div>
          <button
            onClick={loadDonors}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
              background: 'white', cursor: 'pointer',
              fontSize: '14px', color: 'var(--color-gray-600)',
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '440px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or municipality…"
            style={{
              width: '100%', padding: '10px 12px 10px 38px',
              border: '1px solid var(--color-gray-200)', borderRadius: '8px',
              fontSize: '14px', outline: 'none', color: 'var(--color-gray-700)',
              background: 'white',
            }}
          />
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Total Donors', value: donors.length, color: '#5C6ED5', bg: 'rgba(92,110,213,0.08)' },
            { label: 'Verified Volunteers', value: donors.filter(d => d.user_profiles?.role === 'verified_volunteer').length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Completed Donations', value: donors.filter(d => d.status === 'completed').length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: '14px 20px', borderRadius: '10px',
                background: stat.bg, flex: 1,
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '14px' }}>
            {error} — Make sure the backend is running and Supabase keys are configured.
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
              Loading donors…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
              {search ? 'No donors match your search.' : 'No donors found. Connect Supabase to load real data.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)' }}>
                  {['Donor', 'Location', 'Contact', 'Role', 'Amount', 'Date', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '12px', fontWeight: 600,
                        color: 'var(--color-gray-500)', letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((donor, i) => {
                  const p = donor.user_profiles;
                  return (
                    <tr
                      key={`${donor.donor_auth_id}-${i}`}
                      style={{
                        borderBottom: '1px solid var(--color-gray-100)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gray-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(92,110,213,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-primary)', flexShrink: 0,
                          }}>
                            <User size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                              {p ? `${p.first_name} ${p.last_name}` : 'Unknown'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                              Member since {p ? formatDate(p.created_at) : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                          <MapPin size={12} />
                          {p ? `${p.municipality}, ${p.province}` : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                          <Phone size={12} />
                          {p?.phone ?? '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                          background: `${roleColor[p?.role ?? 'donor'] ?? '#9CA3AF'}20`,
                          color: roleColor[p?.role ?? 'donor'] ?? '#9CA3AF',
                        }}>
                          {p?.role ?? 'donor'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-800)', fontSize: '14px', fontWeight: 600 }}>
                          <Heart size={12} color="#EF4444" />
                          {formatAmount(donor.amount, donor.currency)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{donor.payment_method}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-500)', fontSize: '13px' }}>
                          <Calendar size={12} />
                          {formatDate(donor.donated_at)}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                          background: donor.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: donor.status === 'completed' ? '#10B981' : '#F59E0B',
                        }}>
                          {donor.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <ChevronRight size={16} color="var(--color-gray-300)" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
