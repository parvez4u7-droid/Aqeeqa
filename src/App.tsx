/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPanel } from './components/admin/AdminPanel';
import { InvitationView } from './components/invitation/InvitationView';
import {
  fetchAdminSession,
  fetchPublicDefaultInvitation,
  fetchPublicInvitationBySlug,
} from './lib/api';
import { AqeeqaInvitationData } from './types/wedding';

function AdminRoute() {
  const [checking, setChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAdminSession()
      .then((res) => {
        if (!mounted) return;
        setAdminUser(res.authenticated && res.user ? res.user : null);
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#061812] flex items-center justify-center text-amber-200 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Verifying session...</span>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onSuccess={(user) => setAdminUser(user)} />;
  }

  return (
    <AdminPanel
      adminUser={adminUser}
      onLoggedOut={() => setAdminUser(null)}
    />
  );
}

function PublicInvitationRoute({ slug }: { slug?: string }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'ok' | 'unpublished' | 'not_found' | 'error'>('ok');
  const [invitation, setInvitation] = useState<AqeeqaInvitationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const loader = slug
      ? fetchPublicInvitationBySlug(slug)
      : fetchPublicDefaultInvitation();

    loader
      .then((res) => {
        if (!mounted) return;
        setStatus(res.status);
        setInvitation(res.invitation || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unable to load invitation.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061812] flex flex-col items-center justify-center p-6 text-amber-100 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
        <p className="font-serif-display text-sm tracking-[0.22em] uppercase">
          Preparing Royal Aqeeqa Invitation
        </p>
      </div>
    );
  }

  if (status === 'unpublished') {
    return (
      <div className="min-h-screen bg-[#061812] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-[#faf7f0] border border-amber-500/40 p-8 text-center space-y-3 shadow-2xl">
          <p className="font-arabic text-2xl text-emerald-900">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <h1 className="font-serif-display text-2xl font-bold text-stone-900">
            Invitation Coming Soon
          </h1>
          <p className="font-serif-display italic text-sm text-stone-600">
            This digital Aqeeqa invitation is currently being prepared and has not been published yet.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'not_found' || status === 'error' || !invitation) {
    return (
      <div className="min-h-screen bg-[#061812] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-[#faf7f0] border border-amber-500/40 p-8 text-center space-y-3 shadow-2xl">
          <h1 className="font-serif-display text-2xl font-bold text-stone-900">
            Invitation Not Found
          </h1>
          <p className="text-sm text-stone-600">
            {errorMessage || 'We could not find the requested Aqeeqa invitation.'}
          </p>
          <a
            href="/"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-900 text-white text-xs font-semibold"
          >
            View Main Invitation
          </a>
        </div>
      </div>
    );
  }

  return <InvitationView data={invitation} />;
}

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/admin') {
    return <AdminRoute />;
  }

  if (pathname.startsWith('/i/')) {
    const slug = decodeURIComponent(pathname.slice(3));
    return <PublicInvitationRoute slug={slug} />;
  }

  return <PublicInvitationRoute />;
}
