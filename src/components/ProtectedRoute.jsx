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
      router.replace('/login');
      return;
    }

    // Check admin access if required
    if (adminOnly && isAdmin()) {
      router.replace('/dashboard');
      return;
    }

    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

