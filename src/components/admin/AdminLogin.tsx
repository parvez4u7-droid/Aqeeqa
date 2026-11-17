import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { adminLogin } from '../../lib/api';

interface AdminLoginProps {
  onSuccess: (user: { id: string; email: string; name: string }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@royalnikah.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061812] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#faf7f0] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center mx-auto border border-amber-500/40">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-900">
            Royal Aqeeqa Studio
          </h1>
          <p className="text-xs text-stone-600">
            Sign in with your administrator credentials to customize and publish Aqeeqa invitations.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
              placeholder="admin@royalnikah.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800/30"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? 'Signing in...' : 'Sign In to Studio'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center space-y-1">
          <p className="text-[11px] text-stone-500">
            Initial setup password: <code className="font-mono text-stone-700">RoyalNikah2026</code>
          </p>
          <a
            href="/"
            className="inline-block text-xs font-medium text-emerald-900 hover:underline pt-1"
          >
            ← Return to Public Invitation
          </a>
        </div>
      </div>
    </div>
  );
};
