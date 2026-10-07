'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip auth check if already on the login page
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) throw new Error('Session check failed');
        const data = await res.json();

        if (isMounted) {
          if (data.authenticated) {
            setAuthorized(true);
          } else {
            setAuthorized(false);
            router.replace('/admin/login');
          }
        }
      } catch {
        if (isMounted) {
          setAuthorized(false);
          router.replace('/admin/login');
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // If on login page, render immediately
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state while checking session
  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin inline-block" />
          <p className="text-xs font-semibold text-stone-500 tracking-wide uppercase">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // If not authorized and redirecting
  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
