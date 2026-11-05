import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LecturerAuth: React.FC = () => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('sunsmartcbt@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== 'sunsmartcbt@gmail.com') {
        throw new Error('Access Denied: Only the designated Sports University administrator (sunsmartcbt@gmail.com) is authorized.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      await signInWithEmail(trimmedEmail, password);
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
      ) {
        setError('Invalid credentials. Please verify your password for sunsmartcbt@gmail.com.');
      } else {
        setError(err?.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4">
      <div className="bg-[#061C13] rounded-3xl shadow-2xl border border-[#D6BF62]/30 overflow-hidden">
        {/* Banner with University Branding */}
        <div className="bg-gradient-to-b from-[#0A2419] to-[#061C13] p-8 text-center border-b border-[#D6BF62]/30">
          <div className="w-18 h-20 mx-auto mb-3 bg-[#030515]/60 rounded-2xl p-2.5 flex items-center justify-center border border-[#D6BF62]/30 shadow-inner">
            <img
              src="/assets/aistudio/IMG-20261104-WA0018_41e50466.jpg"
              alt="SUN Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6BF62]/10 border border-[#D6BF62]/30 text-[#D6BF62] text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Faculty Portal</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#F0F9F3]">Lecturer Sign In</h2>
          <p className="text-xs text-[#ADCDBA] mt-1 font-medium">
            Sports University of Nigeria Examination System
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-[#2A0808] border border-red-500/40 rounded-xl flex items-start gap-2.5 text-red-200 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#ADCDBA] mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#789981] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sunsmartcbt@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0A2419] border border-[#789981]/40 rounded-xl text-sm font-semibold text-[#F0F9F3] placeholder-[#789981]/70 focus:outline-none focus:border-[#D6BF62] focus:ring-1 focus:ring-[#D6BF62] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#ADCDBA] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#789981] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0A2419] border border-[#789981]/40 rounded-xl text-sm font-medium text-[#F0F9F3] placeholder-[#789981]/70 focus:outline-none focus:border-[#D6BF62] focus:ring-1 focus:ring-[#D6BF62] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0E623B] hover:bg-[#127949] border border-[#D6BF62] text-[#F0F9F3] font-bold rounded-xl text-sm transition shadow-lg hover:shadow-[#0E623B]/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#F0F9F3] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#D6BF62]" />
                  <span>Continue with Password</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-[#789981] border-t border-[#789981]/20">
            Protected examination management portal • Single administrative access control
          </div>
        </div>
      </div>
    </div>
  );
};
