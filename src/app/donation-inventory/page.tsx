"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DonationsAPI, CampaignsAPI } from '@/lib/api';
import {
  Heart,
  Calendar,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Clock,
  Package,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function DonationInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, camps] = await Promise.all([
        DonationsAPI.inventory(selectedCampaign || undefined),
        CampaignsAPI.list({ status: 'active' }),
      ]);
      setInventory(inv);
      setCampaigns(camps);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredInventory = inventory.filter((item) => {
    if (!search) return true;
    return item.campaign?.title?.toLowerCase().includes(search.toLowerCase());
  });

  const totalRaised = inventory.reduce((sum, item) => sum + item.total_raised, 0);
  const totalDonations = inventory.reduce((sum, item) => sum + item.donation_count, 0);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const paymentMethodColors: Record<string, string> = {
    gcash: '#00AEEF',
    maya: '#00B050',
    bank_transfer: '#5C6ED5',
    cash: '#F59E0B',
    card: '#9C27B0',
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
              Donation Inventory
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>
              Items, sites, amounts, and schedules by campaign
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

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="card" style={{ padding: '20px', background: 'rgba(92,110,213,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(92,110,213,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="var(--color-primary)" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>Total Raised</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatAmount(totalRaised)}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: 'rgba(16,185,129,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="#10B981" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>Completed Donations</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#10B981' }}>
              {totalDonations.toLocaleString()}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: 'rgba(245,158,11,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} color="#F59E0B" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>Active Campaigns</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#F59E0B' }}>
              {inventory.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', maxWidth: '360px', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns…"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                fontSize: '14px', outline: 'none', color: 'var(--color-gray-700)',
                background: 'white',
              }}
            />
          </div>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '8px',
              border: '1px solid var(--color-gray-200)',
              fontSize: '14px', color: 'var(--color-gray-600)', background: 'white',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">All Campaigns</option>
            {campaigns.map((c: any) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} /> {error} — Ensure the backend is running and Supabase keys are set.
          </div>
        )}

        {/* Inventory List */}
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
            Loading inventory…
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '14px' }}>
            {search || selectedCampaign ? 'No campaigns match your filters.' : 'No completed donations found. Connect Supabase to load real data.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredInventory.map((item: any) => {
              const camp = item.campaign ?? {};
              const org = camp.organizations ?? {};
              const isExpanded = expandedCampaigns.has(camp.id);
              const progress = camp.target_amount > 0 ? Math.min(100, (item.total_raised / camp.target_amount) * 100) : 0;

              return (
                <div key={camp.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
                  {/* Campaign Header */}
                  <button
                    onClick={() => toggleCampaign(camp.id)}
                    style={{
                      width: '100%', padding: '20px 24px', textAlign: 'left', cursor: 'pointer',
                      background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '16px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-gray-800)' }}>
                          {camp.title ?? 'Untitled Campaign'}
                        </span>
                        <span style={{
                          padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                          background: 'rgba(92,110,213,0.08)', color: 'var(--color-primary)',
                          textTransform: 'capitalize',
                        }}>
                          {camp.type ?? '—'}
                        </span>
                        <span style={{
                          padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                          background: camp.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: camp.status === 'active' ? '#10B981' : '#F59E0B',
                          textTransform: 'capitalize',
                        }}>
                          {camp.status ?? 'unknown'}
                        </span>
                      </div>

                      {/* Org info */}
                      {org.name && (
                        <div style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                          <Building2 size={12} /> {org.name}
                          {org.address && <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11} />{org.address}</span>}
                        </div>
                      )}

                      {/* Campaign dates */}
                      {camp.start_date && (
                        <div style={{ fontSize: '12px', color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                          <Calendar size={11} /> {formatDate(camp.start_date)} → {formatDate(camp.end_date)}
                        </div>
                      )}

                      {/* Progress bar */}
                      {camp.target_amount > 0 && (
                        <div>
                          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-gray-200)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '3px', background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.4s' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{formatAmount(item.total_raised)} raised</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>Goal: {formatAmount(camp.target_amount)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {formatAmount(item.total_raised)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>{item.donation_count} donations</div>
                      </div>
                      {isExpanded ? <ChevronDown size={18} color="var(--color-gray-400)" /> : <ChevronRight size={18} color="var(--color-gray-400)" />}
                    </div>
                  </button>

                  {/* Expanded Donations Table */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--color-gray-100)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-gray-50)' }}>
                            {['Amount', 'Payment Method', 'Date & Time', 'Status'].map((h) => (
                              <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.donations.map((don: any, i: number) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--color-gray-100)' }}>
                              <td style={{ padding: '12px 24px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gray-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Heart size={12} color="#EF4444" />
                                  {formatAmount(don.amount)}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>{don.currency}</div>
                              </td>
                              <td style={{ padding: '12px 24px' }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                                  background: `${paymentMethodColors[don.payment_method] ?? '#9CA3AF'}18`,
                                  color: paymentMethodColors[don.payment_method] ?? '#9CA3AF',
                                  textTransform: 'capitalize',
                                }}>
                                  {don.payment_method?.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td style={{ padding: '12px 24px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={12} />
                                  {don.donated_at ? new Date(don.donated_at).toLocaleString('en-PH', {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  }) : '—'}
                                </div>
                              </td>
                              <td style={{ padding: '12px 24px' }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                                  background: 'rgba(16,185,129,0.1)', color: '#10B981',
                                }}>
                                  {don.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
