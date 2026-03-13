"use client";

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VolunteerApplicationsAPI } from '@/lib/api';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Heart,
  AlertCircle,
  ExternalLink,
  Calendar,
  Star,
  Clock,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Facebook,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STEP_LABELS = ['Review Details', 'Verify Documents', 'Make Decision'];

export default function ApplicationReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection modal state
  const [showRejectDocsModal, setShowRejectDocsModal] = useState(false);
  const [showRejectAppModal, setShowRejectAppModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [facebookPsid, setFacebookPsid] = useState('');

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VolunteerApplicationsAPI.get(id);
      setApplication(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const notify = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // ─── Workflow Actions ────────────────────────────────────────────────────────

  const handleApproveDocuments = async () => {
    setActionLoading(true);
    try {
      await VolunteerApplicationsAPI.approveDocuments(id);
      notify('success', 'Documents verified. Applicant marked as verified volunteer.');
      loadApplication();
    } catch (e: any) {
      notify('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocuments = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await VolunteerApplicationsAPI.rejectDocuments(id, rejectReason, facebookPsid || undefined);
      notify('success', `Documents rejected. ${facebookPsid ? 'Facebook notification sent.' : 'No FB notification (PSID not provided).'}`);
      setShowRejectDocsModal(false);
      setRejectReason('');
      setFacebookPsid('');
      loadApplication();
    } catch (e: any) {
      notify('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveApplication = async () => {
    setActionLoading(true);
    try {
      await VolunteerApplicationsAPI.approveApplication(id, 'site-manager');
      notify('success', 'Application approved! Volunteer is now scheduled for deployment.');
      loadApplication();
    } catch (e: any) {
      notify('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await VolunteerApplicationsAPI.rejectApplication(id, rejectReason);
      notify('success', 'Application has been rejected.');
      setShowRejectAppModal(false);
      setRejectReason('');
      loadApplication();
    } catch (e: any) {
      notify('error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const currentStep = () => {
    if (!application) return 0;
    switch (application.status) {
      case 'pending': return 0;
      case 'document_review': return 1;
      case 'documents_valid': return 2;
      case 'documents_rejected': return 1;
      case 'approved': return 3;
      case 'rejected': return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-gray-400)' }}>Loading application…</div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div style={{ padding: '48px', textAlign: 'center', color: '#EF4444' }}>
          {error ?? 'Application not found'}
          <br />
          <Link href="/volunteer-applications" style={{ color: 'var(--color-primary)', fontSize: '14px' }}>
            ← Back to queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const profile = application.user_profiles ?? {};
  const role = application.volunteer_roles ?? {};
  const campaign = application.bh_campaigns ?? {};
  const step = currentStep();
  const isTerminal = ['approved', 'rejected', 'documents_rejected'].includes(application.status);

  return (
    <DashboardLayout>
      {/* Action Banner */}
      {actionMessage && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 100,
          padding: '12px 18px', borderRadius: '10px', maxWidth: '360px',
          background: actionMessage.type === 'success' ? '#10B981' : '#EF4444',
          color: 'white', fontSize: '14px', fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          {actionMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {actionMessage.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Back + Header */}
        <div>
          <Link href="/volunteer-applications" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-gray-500)', fontSize: '14px', marginBottom: '12px' }}>
            <ArrowLeft size={14} /> Back to Queue
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-gray-800)' }}>
              Review Application
            </h1>
            {/* Status Badge */}
            <span style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
              background: application.status === 'approved' ? 'rgba(16,185,129,0.1)'
                : application.status === 'rejected' || application.status === 'documents_rejected' ? 'rgba(239,68,68,0.1)'
                : 'rgba(92,110,213,0.1)',
              color: application.status === 'approved' ? '#10B981'
                : application.status === 'rejected' || application.status === 'documents_rejected' ? '#EF4444'
                : '#5C6ED5',
            }}>
              {application.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : undefined }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i < step ? '#10B981' : i === step ? 'var(--color-primary)' : 'var(--color-gray-200)',
                    color: i <= step ? 'white' : 'var(--color-gray-400)',
                    fontSize: '13px', fontWeight: 700,
                  }}>
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: i <= step ? 'var(--color-gray-700)' : 'var(--color-gray-400)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: i < step ? '#10B981' : 'var(--color-gray-200)', margin: '0 8px', marginBottom: '20px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Applicant Profile */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="var(--color-primary)" /> Applicant Profile
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name', value: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || '—' },
                  { label: 'Phone', value: profile.phone ?? '—', icon: <Phone size={12} /> },
                  { label: 'Address', value: profile.address ?? '—' },
                  { label: 'Barangay', value: profile.barangay ?? '—' },
                  { label: 'Municipality', value: profile.municipality ?? '—', icon: <MapPin size={12} /> },
                  { label: 'Province', value: profile.province ?? '—' },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-gray-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.icon} {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Also a donor indicator */}
              {application.is_also_donor && (
                <div style={{
                  marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '13px', fontWeight: 500,
                }}>
                  <Heart size={14} /> This applicant is also a donor
                </div>
              )}
            </div>

            {/* Motivation & Skills */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} color="var(--color-primary)" /> Motivation & Skills
              </h2>
              {application.motivation && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Motivation
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-gray-700)', lineHeight: 1.6, padding: '12px', background: 'var(--color-gray-50)', borderRadius: '8px' }}>
                    {application.motivation}
                  </p>
                </div>
              )}
              {application.skills?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {application.skills.map((skill: string) => (
                      <span key={skill} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                        background: 'rgba(92,110,213,0.08)', color: 'var(--color-primary)',
                      }}>
                        <Tag size={10} /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {application.availability && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Availability
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-gray-700)' }}>
                    <Clock size={12} color="var(--color-gray-400)" /> {application.availability}
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Document */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--color-primary)" /> Uploaded Document / Resume
              </h2>
              {application.resume_signed_url ? (
                <a
                  href={application.resume_signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px', borderRadius: '10px',
                    border: '1px dashed var(--color-primary)',
                    background: 'rgba(92,110,213,0.04)',
                    color: 'var(--color-primary)', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(92,110,213,0.08)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(92,110,213,0.04)')}
                >
                  <FileText size={20} />
                  <div>
                    <div>{application.resume_key ?? 'Resume / CV'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-400)', fontWeight: 400 }}>Click to view in new tab</div>
                  </div>
                  <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                </a>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', background: 'var(--color-gray-50)', borderRadius: '8px', color: 'var(--color-gray-400)', fontSize: '13px' }}>
                  {application.resume_key ? 'Could not generate document URL. Check Supabase bucket configuration.' : 'No document uploaded.'}
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Role, Campaign, Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Role Details */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '14px' }}>
                Role Applied For
              </h2>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
                {role.title ?? '—'}
              </div>
              {role.description && (
                <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {role.description}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {role.location && (
                  <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', gap: '6px' }}>
                    <MapPin size={13} /> {role.location}
                  </span>
                )}
                {role.start_date && (
                  <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', display: 'flex', gap: '6px' }}>
                    <Calendar size={13} /> {formatDate(role.start_date)} → {formatDate(role.end_date)}
                  </span>
                )}
              </div>
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'var(--color-gray-50)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginBottom: '2px' }}>Slots</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-gray-800)' }}>
                  {role.slots_filled ?? 0} / {role.slots_total ?? 0} filled
                </div>
              </div>
            </div>

            {/* Campaign */}
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '14px' }}>
                Campaign
              </h2>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
                {campaign.title ?? '—'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginBottom: '8px', textTransform: 'capitalize' }}>
                {campaign.type} · {campaign.status}
              </div>
              {campaign.target_amount && (
                <div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-gray-200)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      background: 'var(--color-primary)',
                      width: `${Math.min(100, (campaign.current_amount / campaign.target_amount) * 100)}%`,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>₱{campaign.current_amount?.toLocaleString()}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>of ₱{campaign.target_amount?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Panel */}
            {!isTerminal && (
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={15} color="var(--color-primary)" /> Review Actions
                </h2>

                {/* Step 1: Document Verification */}
                {(application.status === 'pending' || application.status === 'document_review') && (
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '14px', lineHeight: 1.5 }}>
                      Review the uploaded document above.
                      Are the submitted documents <strong>valid</strong>?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        disabled={actionLoading}
                        onClick={handleApproveDocuments}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '12px', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
                          background: '#10B981', color: 'white', border: 'none',
                          fontSize: '14px', fontWeight: 600, opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        <ThumbsUp size={16} /> Yes — Documents Valid
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => setShowRejectDocsModal(true)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '12px', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
                          background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                          border: '1px solid rgba(239,68,68,0.2)',
                          fontSize: '14px', fontWeight: 600, opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        <ThumbsDown size={16} /> No — Reject & Notify via FB
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Application Approval */}
                {application.status === 'documents_valid' && (
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '14px', lineHeight: 1.5 }}>
                      Documents are verified. Do you want to <strong>approve</strong> this volunteer application?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button
                        disabled={actionLoading}
                        onClick={handleApproveApplication}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '12px', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
                          background: 'var(--color-primary)', color: 'white', border: 'none',
                          fontSize: '14px', fontWeight: 600, opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        <CheckCircle size={16} /> Yes — Approve Application
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => setShowRejectAppModal(true)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '12px', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer',
                          background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                          border: '1px solid rgba(239,68,68,0.2)',
                          fontSize: '14px', fontWeight: 600, opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        <XCircle size={16} /> No — Reject Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Post-Approval: Link to Donation Inventory */}
            {application.status === 'approved' && (
              <Link href="/donation-inventory" style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '18px', cursor: 'pointer',
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <CheckCircle size={18} color="#10B981" />
                    <span style={{ fontWeight: 600, color: '#10B981', fontSize: '14px' }}>Application Approved</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginBottom: '12px' }}>
                    Review donation inventory, items, sites and deployment schedule.
                  </p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px',
                    background: '#10B981', color: 'white',
                    fontSize: '13px', fontWeight: 600,
                  }}>
                    View Donation Inventory →
                  </span>
                </div>
              </Link>
            )}

            {/* Terminal Status Display */}
            {(application.status === 'rejected' || application.status === 'documents_rejected') && (
              <div className="card" style={{
                padding: '18px',
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 600, fontSize: '14px' }}>
                  <XCircle size={16} />
                  {application.status === 'documents_rejected' ? 'Documents Rejected' : 'Application Rejected'}
                </div>
                {application.status === 'documents_rejected' && (
                  <p style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginTop: '8px' }}>
                    User has been notified. They may resubmit with valid documents.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Documents Modal */}
      {showRejectDocsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div className="card" style={{ padding: '28px', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThumbsDown size={18} color="#EF4444" /> Reject Documents
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', marginBottom: '20px' }}>
              Provide a reason. If you enter the applicant's Facebook PSID, a Messenger notification will be sent automatically.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)', display: 'block', marginBottom: '6px' }}>
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. The ID document submitted appears to be expired…"
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                  fontSize: '14px', outline: 'none', resize: 'vertical',
                  color: 'var(--color-gray-700)',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Facebook size={13} color="#1877F2" /> Applicant's Facebook PSID (optional)
              </label>
              <input
                value={facebookPsid}
                onChange={(e) => setFacebookPsid(e.target.value)}
                placeholder="e.g. 1234567890987654"
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                  fontSize: '14px', outline: 'none', color: 'var(--color-gray-700)',
                }}
              />
              <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                The PSID is obtained when the user messages your Facebook Page. Leave blank to skip FB notification.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRejectDocsModal(false); setRejectReason(''); }}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--color-gray-200)', background: 'white', cursor: 'pointer', fontSize: '14px', color: 'var(--color-gray-600)' }}>
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || actionLoading}
                onClick={handleRejectDocuments}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                  background: '#EF4444', color: 'white', fontSize: '14px', fontWeight: 600,
                  opacity: !rejectReason.trim() || actionLoading ? 0.6 : 1,
                }}
              >
                {facebookPsid ? 'Reject & Notify via FB' : 'Reject Documents'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectAppModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div className="card" style={{ padding: '28px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '8px' }}>
              Reject Application
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', marginBottom: '20px' }}>
              Provide a brief reason for rejecting this volunteer application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', marginBottom: '20px',
                border: '1px solid var(--color-gray-200)', borderRadius: '8px',
                fontSize: '14px', outline: 'none', resize: 'vertical',
                color: 'var(--color-gray-700)',
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRejectAppModal(false); setRejectReason(''); }}
                style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--color-gray-200)', background: 'white', cursor: 'pointer', fontSize: '14px', color: 'var(--color-gray-600)' }}>
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || actionLoading}
                onClick={handleRejectApplication}
                style={{
                  padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                  background: '#EF4444', color: 'white', fontSize: '14px', fontWeight: 600,
                  opacity: !rejectReason.trim() || actionLoading ? 0.6 : 1,
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
