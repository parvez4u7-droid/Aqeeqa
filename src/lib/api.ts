import { MediaAttachmentRef, MediaKind, RsvpSubmission, WeddingInvitationData } from '../types/wedding';

const ADMIN_TOKEN_KEY = 'royal_nikah_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
  includeAuth = false
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (includeAuth) {
    const token = getStoredAdminToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      payload?.error ||
      (Array.isArray(payload?.validationErrors) && payload.validationErrors[0]) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchPublicDefaultInvitation(): Promise<{
  status: 'ok' | 'unpublished';
  invitation?: WeddingInvitationData;
}> {
  const res = await fetch('/api/public/invitation', { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data?.status === 'unpublished') {
      return { status: 'unpublished' };
    }
    throw new Error(data?.error || 'Could not load Aqeeqa invitation.');
  }
  return { status: 'ok', invitation: data.invitation };
}

export async function fetchPublicInvitationBySlug(slug: string): Promise<{
  status: 'ok' | 'unpublished' | 'not_found';
  invitation?: WeddingInvitationData;
}> {
  const res = await fetch(`/api/public/invitation/${encodeURIComponent(slug)}`, {
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 403 && data?.status === 'unpublished') {
      return { status: 'unpublished' };
    }
    if (res.status === 404) {
      return { status: 'not_found' };
    }
    throw new Error(data?.error || 'Could not load Aqeeqa invitation.');
  }
  return { status: 'ok', invitation: data.invitation };
}

export async function submitGuestRsvp(
  slug: string,
  rsvp: {
    guestName: string;
    guestPhone: string;
    guestsCount: number;
    status: 'attending' | 'declined';
    blessingMessage: string;
  }
): Promise<RsvpSubmission> {
  const res = await apiFetch<{ ok: boolean; rsvp: RsvpSubmission }>(
    `/api/public/invitation/${encodeURIComponent(slug)}/rsvp`,
    {
      method: 'POST',
      body: JSON.stringify(rsvp),
    }
  );
  return res.rsvp;
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  const res = await apiFetch<{
    token: string;
    user: { id: string; email: string; name: string };
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredAdminToken(res.token);
  return res;
}

export async function adminLogout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' }, true);
  } finally {
    setStoredAdminToken(null);
  }
}

export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  user?: { id: string; email: string; name: string };
}> {
  try {
    return await apiFetch<{
      authenticated: boolean;
      user: { id: string; email: string; name: string };
    }>('/api/auth/me', {}, true);
  } catch {
    return { authenticated: false };
  }
}

export async function updateAdminCredentials(input: {
  currentPassword: string;
  newPassword?: string;
  email?: string;
  name?: string;
}): Promise<{ id: string; email: string; name: string }> {
  const res = await apiFetch<{ ok: boolean; user: { id: string; email: string; name: string } }>(
    '/api/auth/update-credentials',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    true
  );
  return res.user;
}

export async function uploadMediaFile(
  file: File,
  kind: MediaKind
): Promise<MediaAttachmentRef> {
  if (!file) {
    throw new Error('Please choose a file to upload.');
  }
  if (file.size > 60 * 1024 * 1024) {
    throw new Error('File exceeds the 60 MB maximum upload limit.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  const data = await apiFetch<MediaAttachmentRef>(
    '/api/media/upload',
    {
      method: 'POST',
      body: formData,
    },
    true
  );

  // Strict client-side guard against incomplete upload responses
  if (!data.attachmentId || !data.attachmentId.trim()) {
    throw new Error('Upload failed: attachmentId is missing from the server response.');
  }
  if (!data.url || !data.url.trim() || data.url.startsWith('blob:')) {
    throw new Error(
      kind === 'audio'
        ? 'The music upload response is missing its persistent file reference.'
        : 'The upload response is missing its persistent file reference.'
    );
  }

  return data;
}

export async function listAdminInvitations(): Promise<WeddingInvitationData[]> {
  const res = await apiFetch<{ invitations: WeddingInvitationData[] }>(
    '/api/admin/invitations',
    {},
    true
  );
  return res.invitations;
}

export async function createAdminInvitation(input: {
  childName: string;
  fatherName: string;
  grandfatherName?: string;
  slug?: string;
}): Promise<WeddingInvitationData> {
  const res = await apiFetch<{ invitation: WeddingInvitationData }>(
    '/api/admin/invitations',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    true
  );
  return res.invitation;
}

export async function saveAdminInvitation(
  id: string,
  invitation: WeddingInvitationData
): Promise<WeddingInvitationData> {
  const res = await apiFetch<{ invitation: WeddingInvitationData }>(
    `/api/admin/invitations/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ invitation }),
    },
    true
  );
  return res.invitation;
}

export async function publishAdminInvitation(
  id: string,
  isPublished: boolean
): Promise<WeddingInvitationData> {
  const res = await apiFetch<{ invitation: WeddingInvitationData }>(
    `/api/admin/invitations/${encodeURIComponent(id)}/publish`,
    {
      method: 'POST',
      body: JSON.stringify({ isPublished }),
    },
    true
  );
  return res.invitation;
}

export async function setDefaultAdminInvitation(
  id: string
): Promise<WeddingInvitationData[]> {
  const res = await apiFetch<{ ok: boolean; invitations: WeddingInvitationData[] }>(
    `/api/admin/invitations/${encodeURIComponent(id)}/set-default`,
    { method: 'POST' },
    true
  );
  return res.invitations;
}

export async function deleteAdminInvitation(id: string): Promise<void> {
  await apiFetch(
    `/api/admin/invitations/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    true
  );
}

export async function listInvitationRsvps(id: string): Promise<RsvpSubmission[]> {
  const res = await apiFetch<{ rsvps: RsvpSubmission[] }>(
    `/api/admin/invitations/${encodeURIComponent(id)}/rsvps`,
    {},
    true
  );
  return res.rsvps;
}
