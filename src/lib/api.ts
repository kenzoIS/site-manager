/**
 * Typed API client for the BayaniHub NestJS backend.
 * All requests go through this module so the base URL can be
 * changed in a single place via NEXT_PUBLIC_API_BASE_URL.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${options?.method ?? 'GET'} ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export const UserProfilesAPI = {
  list: (role?: string) =>
    request<any[]>(`/user-profiles${role ? `?role=${role}` : ''}`),
  donors: () => request<any[]>('/user-profiles/donors'),
  get: (id: string) => request<any>(`/user-profiles/${id}`),
};

// ─── Volunteer Roles ─────────────────────────────────────────────────────────

export const VolunteerRolesAPI = {
  list: (params?: { campaign_id?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/volunteer-roles${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<any>(`/volunteer-roles/${id}`),
};

// ─── Volunteer Applications ──────────────────────────────────────────────────

export const VolunteerApplicationsAPI = {
  list: (params?: {
    role_id?: string;
    campaign_id?: string;
    status?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== ''),
      ) as Record<string, string>,
    ).toString();
    return request<any[]>(`/volunteer-applications${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => request<any>(`/volunteer-applications/${id}`),

  rejectDocuments: (id: string, reason: string) =>
    request<any>(`/volunteer-applications/${id}/reject-documents`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  approveDocuments: (id: string) =>
    request<any>(`/volunteer-applications/${id}/approve-documents`, { method: 'PATCH' }),

  rejectApplication: (id: string, reason: string) =>
    request<any>(`/volunteer-applications/${id}/reject-application`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  approveApplication: (id: string, reviewed_by: string) =>
    request<any>(`/volunteer-applications/${id}/approve-application`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewed_by }),
    }),
};

// ─── Donations ───────────────────────────────────────────────────────────────

export const DonationsAPI = {
  list: (params?: { campaign_id?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/donations${qs ? `?${qs}` : ''}`);
  },
  inventory: (campaign_id?: string) =>
    request<any[]>(`/donations/inventory${campaign_id ? `?campaign_id=${campaign_id}` : ''}`),
  get: (id: string) => request<any>(`/donations/${id}`),
};

// ─── Campaigns ───────────────────────────────────────────────────────────────

export const CampaignsAPI = {
  list: (params?: { type?: string; status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<any>(`/campaigns/${id}`),
};

// ─── Missions ────────────────────────────────────────────────────────────────

export const MissionsAPI = {
  activate: (payload: {
    campaign_id: string;
    role_id: string;
    urgency: string;
    notes?: string;
    activated_by?: string;
  }) =>
    request<any>('/missions/activate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  volunteerSummary: (campaign_id?: string) =>
    request<any>(
      `/missions/volunteer-summary${campaign_id ? `?campaign_id=${campaign_id}` : ''}`,
    ),
};
