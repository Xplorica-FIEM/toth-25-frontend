// components/ProtectedRoute.jsx - Protected route wrapper

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, isAdmin } from '@/utils/auth';
import Loader from '@/pages/loadinganimation';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
}

