import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RiddleTemplate from '../components/RiddleTemplate';

const ViewRiddles = () => {
  const router = useRouter();
  const [riddle, setRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for the router to be ready
    if (!router.isReady) return;

    // Get the riddle ID from query or cache
    let riddleId = router.query.id;
    
    // If no ID in URL, check localStorage cache
    if (!riddleId) {
      riddleId = localStorage.getItem('currentRiddleId');
      if (riddleId) {
        // Update URL with cached ID (without reloading)
        router.replace({
          pathname: '/viewriddles',
          query: { id: riddleId }
        }, undefined, { shallow: true });
      } else {
        router.push('/dashboard');
        return;
      }
    }

    // Prevent refetching if we already have the same riddle
    if (riddle && riddle.id === riddleId) {
      return;
    }

    // Fetch riddle data from the API
    const fetchRiddle = async () => {
      try {
        // Show minimal loading state
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/game/riddle/${riddleId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // CRITICAL: Set riddle data immediately so user can read it
          setRiddle(data.riddle);
          setLoading(false); // ✅ User can now read riddle!
          
          // Update cache with current riddle ID
          localStorage.setItem('currentRiddleId', data.riddle.id);
        } else {
          setError(data.error || 'Failed to retrieve riddle data.');
          setLoading(false);
          // Clear invalid cache
          localStorage.removeItem('currentRiddleId');
        }
      } catch (err) {
        setError('Riddle not found or access denied.');
        setLoading(false);
        // Clear invalid cache
        localStorage.removeItem('currentRiddleId');
      }
    };

    fetchRiddle();

  }, [router.isReady, router.query.id]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-stone-900 via-amber-900/20 to-stone-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-amber-400 font-mono text-xl animate-pulse">Loading Riddle...</p>
          <p className="text-amber-200/60 text-sm mt-2">Preparing your challenge</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-stone-900 via-red-900/20 to-stone-900 text-red-400 font-mono">
        <div className="text-center max-w-md mx-auto p-8">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-2xl mb-4">ERROR</p>
          <p className="text-lg mb-6">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-red-900/30 border border-red-500 hover:bg-red-900/50 transition-colors rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render the Riddle
  if (!riddle) {
    return null;
  }

  return (
    <RiddleTemplate 
      riddleContent={riddle.puzzleText}
      title={riddle.riddleName}
      orderNumber={riddle.orderNumber}
      backgroundImage={getBackgroundImage(riddle.orderNumber)}
      isAuthenticated={true}
      riddleId={riddle.id}
    />
  );
};

// Helper for background images
const getBackgroundImage = (orderNumber) => {
  const backgrounds = {
    1: '/toth1.png',
    2: '/toth2.png',
    3: '/toth3.png',
    4: '/toth4.png',
    5: '/toth5.png',
    6: '/toth6.png',
    7: '/toth7.png',
    8: '/toth8.png'  
  };
  return backgrounds[orderNumber] || '/toth1.png';
};

export default ViewRiddles;