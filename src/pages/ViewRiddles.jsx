import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios'; // We use this to fetch the data based on the ID
import RiddleTemplate from '../components/RiddleTemplate';
import Cookies from 'js-cookie';

const ViewRiddles = () => {
  const router = useRouter();
  const [riddle, setRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for the router to be ready
    if (!router.isReady) return;

    // 1. Extract the Hidden ID from the Router State
    // This value comes from the secure redirection, NOT the URL string.
    const { id } = router.query;

    if (!id) {
      // If the ID is missing (e.g., user refreshed the page or typed URL manually),
      // we banish them back to the scanner or dashboard.
      console.warn("No ID detected.");
      router.push('/scan'); 
      return;
    }

    // 2. Fetch the Riddle Content from the Archives (API)
    // We use the ID to get the fresh data from the server.
    const fetchRiddle = async () => {
      try {
        // Ensure you have a route like GET /api/riddles/:id or /api/scan/result/:id
        // Since this is a user view, ensure the endpoint validates if the user is allowed to see this.
        const token = Cookies.get('token');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setRiddle(response.data.riddle);
        } else {
          setError('Failed to retrieve riddle data.');
        }
      } catch (err) {
        console.error("Transmission Intercepted:", err);
        setError('Riddle not found or access denied.');
      } finally {
        setLoading(false);
      }
    };

    fetchRiddle();

  }, [router.isReady, router.query]);

  // Loading State (The Waiting Room)
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-green-500 font-mono text-xl">
        <div className="animate-pulse">Accessing Secure Archives...</div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-red-500 font-mono">
        <p className="text-2xl mb-4">⚠️ SYSTEM ERROR</p>
        <p>{error}</p>
        <button 
          onClick={() => router.push('/scan')}
          className="mt-6 px-4 py-2 border border-red-500 hover:bg-red-900 transition-colors"
        >
          Return to Scanner
        </button>
      </div>
    );
  }

  // 3. Render the Riddle Template
  return (
    <RiddleTemplate 
      riddleContent={riddle?.puzzle || riddle?.encryptedPuzzle} // Handle depending on what API returns
      title={riddle?.title}
      //points={riddle?.points}
      // Map the ID or Order Number to a specific background
      backgroundImage={getBackgroundImage(randomIntFromInterval(1, 8))}
      isAuthenticated={true} // We verified token in the fetch
    />
  );
};

// Helper for visual assets
function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const getBackgroundImage = (orderNumber) => {
  // Mapping order numbers to assets
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
  return backgrounds[orderNumber] || '/assets/riddles/default.jpg';
};

export default ViewRiddles;