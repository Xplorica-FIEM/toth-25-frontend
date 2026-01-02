// components/ProtectedRoute.jsx - Protected route wrapper

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, isAdmin } from '@/utils/auth';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once on mount
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check authentication
    if (!isAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }

    // Check admin access if required
    if (adminOnly && !isAdmin()) {
      console.log('❌ Admin access required but user is not admin, redirecting to dashboard');
      console.log('User data:', JSON.parse(localStorage.getItem('user') || '{}'));
      router.replace('/dashboard');
      return;
    }

    console.log('✅ Access granted. Admin only:', adminOnly, 'Is admin:', isAdmin());
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

