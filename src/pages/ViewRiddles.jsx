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
          pathname: '/ViewRiddles',
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

    // Try to load from cache FIRST (instant display)
    const cachedData = localStorage.getItem('currentRiddleData');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (parsedData.id === riddleId) {
          console.log('✅ Using cached riddle:', parsedData.riddleName, 'Text length:', parsedData.puzzleText?.length);
          // Use cached data immediately - INSTANT LOAD
          setRiddle(parsedData);
          setLoading(false);
          return; // No API call needed!
        }
      } catch (e) {
        console.log('Cache parse error, fetching from API', e);
      }
    }

    // Fallback: Fetch riddle data from the API (only if cache miss)
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
          // Set riddle data
          setRiddle(data.riddle);
          setLoading(false);
          
          // Update cache
          localStorage.setItem('currentRiddleId', data.riddle.id);
          localStorage.setItem('currentRiddleData', JSON.stringify(data.riddle));
        } else {
          setError(data.error || 'Failed to retrieve riddle data.');
          setLoading(false);
          // Clear invalid cache
          localStorage.removeItem('currentRiddleId');
          localStorage.removeItem('currentRiddleData');
        }
      } catch (err) {
        setError('Riddle not found or access denied.');
        setLoading(false);
        // Clear invalid cache
        localStorage.removeItem('currentRiddleId');
        localStorage.removeItem('currentRiddleData');
      }
    };

    fetchRiddle();

  }, [router.isReady, router.query.id]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-linear-to-br from-stone-900 via-amber-900/20 to-stone-900">
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
      backgroundImage={getBackgroundImage(riddle.id)}
      isAuthenticated={true}
      riddleId={riddle.id}
    />
  );
};

// Helper for background images
const getBackgroundImage = (riddleId) => {
  const backgrounds = ['/toth1.png', '/toth2.png', '/toth3.png', '/toth4.png', '/toth5.png', '/toth6.png', '/toth7.png', '/toth8.png'];
  const hash = riddleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return backgrounds[hash % backgrounds.length];
};

export default ViewRiddles;