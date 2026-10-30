import React, { useState } from 'react';
import { X, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { dataStore } from '../../lib/dataStore';
import type { AppUser } from '../../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (user: AppUser) => void;
  reason?: 'post_property' | 'contact_owner' | 'general';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  reason = 'general',
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await dataStore.loginWithGoogle();
      onSignIn(user);
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // user ne popup band kar diya — kuch na dikhayen
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('Ye domain Firebase > Authentication > Authorized domains mein add nahi hai.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Browser ne popup block kar diya. Popup allow karke dobara try karen.');
      } else {
        setErrorMsg(err?.message || 'Google login fail ho gaya. Dobara try karen.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-lg">
              M
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Google Sign-In</h3>
              <p className="text-[11px] text-slate-500">Exclusively authenticated via Google Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Context Banner */}
        <div className="p-6 space-y-4 text-sm text-slate-700">
          {reason === 'post_property' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Registration Required to Post Property
              </p>
              <p className="text-emerald-700 leading-relaxed">
                To maintain verified property quality and protect buyers from duplicate or fake listings, property publishers must sign in with Google and provide a valid Pakistani mobile number.
              </p>
            </div>
          )}

          {reason === 'contact_owner' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-blue-800">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                Owner Contact Protection Active
              </p>
              <p className="text-blue-700 leading-relaxed">
                To prevent automated scrapers and telemarketing spam, owner phone numbers and WhatsApp links are revealed exclusively to authenticated Google users.
              </p>
            </div>
          )}

          {reason === 'general' && (
            <p className="text-xs text-slate-600">
              Welcome to <strong>Makani Pakistan</strong>. Sign in with your Google Account to manage listings, save favorite properties, submit website reviews, or access your advertiser dashboard.
            </p>
          )}

           {/* Google Sign In */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 p-3.5 border border-slate-300 hover:border-emerald-600 rounded-xl bg-white hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="font-semibold text-slate-900 text-sm">
                {loading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{errorMsg}</p>
            )}
          </div>

          {/* Security guarantee note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Strict Google OAuth Flow
            </span>
            <span>No password storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
