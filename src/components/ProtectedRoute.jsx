// components/ProtectedRoute.jsx - Protected route wrapper

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '@/utils/auth';
import { getCurrentUser } from '@/utils/api';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Only check once on mount
      if (hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      // 1. Check if token exists
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      try {
        // 2. Fetch fresh user data from backend
        const res = await getCurrentUser();
        
        if (!res.ok || !res.data?.user) {
          // Token invalid or user not found
          router.replace('/login');
          return;
        }

        const user = res.data.user;

        // 3. Check admin access if required
        if (adminOnly && !user.isAdmin) {
          router.replace('/dashboard');
          return;
        }
        
        // Access granted
        setLoading(false);

      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace('/login');
      }
    };

    checkAccess();
  }, [adminOnly, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent mb-4"></div>
         <p className="text-amber-400 font-mono text-lg animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}

