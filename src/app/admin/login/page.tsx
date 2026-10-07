'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, KeyRound, User, Lock, ChefHat } from 'lucide-react';

function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.push('/admin');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid ID or password');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Network error during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE6DF] shadow-xl p-8 space-y-6 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-stone-900 to-amber-600" />

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center relative w-12 h-12 rounded-2xl bg-[#141413] text-amber-500 font-serif font-medium text-xl shadow-md mb-2">
          <ChefHat className="w-6 h-6 text-amber-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-[11px] font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Kitchen Administration</span>
        </div>

        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-tight">
          Desi Dutch Portal
        </h1>
        <p className="text-xs text-stone-500 max-w-xs mx-auto">
          Enter admin credentials to access inventory and menu controls
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Admin User ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username / ID"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5]/80 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition-all"
            />
            <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5]/80 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition-all"
            />
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password || !username}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-40 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Sign In to Dashboard</span>
          )}
        </button>
      </form>

      {/* Back to Storefront Link */}
      <div className="pt-2 text-center border-t border-stone-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Desi Dutch Storefront</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-stone-400">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
