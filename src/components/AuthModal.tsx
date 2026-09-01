import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
  Crown,
  TrendingUp,
  Package,
  ShoppingBag,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { api } from '../lib/api';
import { soundFx } from '../lib/soundFx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialTab?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'signin',
}) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(initialTab);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('pooja.sharma@poojastore.com');
  const [signInPassword, setSignInPassword] = useState('PoojaStore2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password Form State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Strength Calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const passStrength = calculateStrength(signUpPassword);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      soundFx.playClick();
      const res = await api.login({
        email: signInEmail,
        password: signInPassword,
      });

      soundFx.playSuccess();
      setSuccessMessage(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to create an account.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password should contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      soundFx.playClick();
      const res = await api.register({
        name: fullName,
        email: signUpEmail,
        password: signUpPassword,
        phone: signUpPhone,
        role: selectedRole,
      });

      soundFx.playSuccess();
      setSuccessMessage(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Account registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      soundFx.playClick();
      const res = await api.forgotPassword(forgotEmail);
      setResetSent(true);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick One-Click Demo Personas
  const handleQuickDemoLogin = async (role: UserRole) => {
    setErrorMessage(null);
    setIsLoading(true);
    soundFx.playClick();

    try {
      const res = await api.switchRole(role);
      soundFx.playSuccess();
      setSuccessMessage(`Authenticated as ${res.user.badge}!`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Main Card */}
      <div className="relative bg-[#0e0e13] text-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/10 z-10 animate-in zoom-in-95 duration-200">
        
        {/* Glow Header */}
        <div className="relative p-6 bg-gradient-to-b from-[#181a24] to-[#0e0e13] border-b border-white/5">
          <div className="absolute top-4 right-4">
            <button
              id="close-auth-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-serif font-black text-xl shadow-lg shadow-indigo-500/20">
              P
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                <span>Pooja Store ID</span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-bold">
                  256-Bit SSL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Universal access to orders, live inventory & executive analytics
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-semibold">
            <button
              id="auth-tab-signin"
              onClick={() => { setTab('signin'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg transition text-center cursor-pointer ${
                tab === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => { setTab('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-2 rounded-lg transition text-center cursor-pointer ${
                tab === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-rose-200/80 text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* 1. SIGN IN TAB */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email or User ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@poojastore.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setForgotEmail(signInEmail); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-emerald-400/90 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Session Encrypted</span>
                </span>
              </div>

              <button
                type="submit"
                id="submit-signin-btn"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP TAB */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {signUpPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            passStrength >= step
                              ? passStrength <= 2
                                ? 'bg-amber-400'
                                : passStrength === 3
                                ? 'bg-blue-400'
                                : 'bg-emerald-400'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 flex justify-between">
                      <span>Strength: {passStrength <= 1 ? 'Weak' : passStrength === 2 ? 'Moderate' : passStrength === 3 ? 'Strong' : 'Very Secure'}</span>
                      <span>Includes uppercase, number, symbol</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      selectedRole === 'customer'
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Shopper / VIP</p>
                      <p className="text-[10px] text-slate-400">Order tracking & perks</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                      selectedRole === 'admin'
                        ? 'border-amber-500/80 bg-amber-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Store Team</p>
                      <p className="text-[10px] text-slate-400">Admin & Logistics</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none text-slate-400 text-xs">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>
                    I agree to the <span className="text-indigo-400 underline">Terms of Service</span> and receive 100 VIP Welcome Points.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="submit-signup-btn"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <span>Create Free Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD TAB */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Password Reset Service</span>
                </p>
                <p className="text-slate-400 mt-1">
                  Enter your registered email address to receive an instant secure reset link and one-time verification token.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || resetSent}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{resetSent ? 'Reset Link Sent ✓' : 'Send Reset Instructions'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setTab('signin'); setResetSent(false); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </form>
          )}

          {/* Quick Demo Personas Strip */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Fast Demo Login</span>
              </span>
              <span className="text-[10px] text-slate-500">Instant test credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 text-left transition flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  👑
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-400 truncate">Store Owner</p>
                  <p className="text-[10px] text-slate-400 truncate">Pooja Sharma (Admin)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-left transition flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  🛍️
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">VIP Shopper</p>
                  <p className="text-[10px] text-slate-400 truncate">Riya Sen (Customer)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('analyst')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 text-left transition flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  📊
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-400 truncate">Analyst</p>
                  <p className="text-[10px] text-slate-400 truncate">Aarav Patel (Finance)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('inventory_manager')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 text-left transition flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  📦
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-blue-400 truncate">Logistics</p>
                  <p className="text-[10px] text-slate-400 truncate">Vikram Mehta (Stock)</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
