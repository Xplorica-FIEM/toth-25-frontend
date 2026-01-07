import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Edit, Scroll, ScanLine } from 'lucide-react';
import { getUser } from '@/utils/auth';
import { getAdminRiddles } from '@/utils/api';

const RiddleTemplate = ({ riddleContent, title, orderNumber, backgroundImage, isAuthenticated, riddleId }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [allRiddles, setAllRiddles] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    
    // Fetch all riddles if admin (to enable next riddle navigation)
    if (user?.isAdmin) {
      fetchRiddles();
    }
  }, []);

  // Handle image loading and fade-in effect
  useEffect(() => {
    setImageLoaded(false);
    setContentVisible(false);
    
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      setImageLoaded(true);
      // Slight delay before showing content for smooth effect
      setTimeout(() => setContentVisible(true), 150);
    };
    img.onerror = () => {
      // Fallback in case image fails to load
      setImageLoaded(true);
      setTimeout(() => setContentVisible(true), 150);
    };
  }, [backgroundImage, riddleId]);

  const fetchRiddles = async () => {
    try {
      const response = await getAdminRiddles();
      if (response.ok && response.data.riddles) {
        setAllRiddles(response.data.riddles);
      }
    } catch (error) {
      console.error('Failed to fetch riddles:', error);
    }
  };

  // Preload next riddle's image for smoother transition
  useEffect(() => {
    if (currentUser?.isAdmin && allRiddles.length > 0 && riddleId) {
      const sortedRiddles = [...allRiddles].sort((a, b) => a.orderNumber - b.orderNumber);
      const currentIndex = sortedRiddles.findIndex(r => r.id === riddleId);
      
      if (currentIndex !== -1 && currentIndex < sortedRiddles.length - 1) {
        const nextRiddle = sortedRiddles[currentIndex + 1];
        // Preload next background image
        const nextBg = getBackgroundImageForOrder(nextRiddle.orderNumber);
        const img = new Image();
        img.src = nextBg;
      }
    }
  }, [currentUser, allRiddles, riddleId]);

  // Helper to get background image based on order number
  const getBackgroundImageForOrder = (orderNumber) => {
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

  const handleNextRiddle = () => {
    if (currentUser?.isAdmin && allRiddles.length > 0) {
      // Find next riddle by order number
      const sortedRiddles = [...allRiddles].sort((a, b) => a.orderNumber - b.orderNumber);
      const currentIndex = sortedRiddles.findIndex(r => r.id === riddleId);
      
      if (currentIndex !== -1 && currentIndex < sortedRiddles.length - 1) {
        // Go to next riddle
        const nextRiddle = sortedRiddles[currentIndex + 1];
        router.push(`/viewriddles?id=${nextRiddle.id}`);
      } else {
        // No more riddles, go to riddles list
        router.push('/admin/riddles');
      }
    } else {
      // Regular user - go back to dashboard to scan
      router.push('/dashboard');
    }
  };

  const handlePreviousRiddle = () => {
    if (currentUser?.isAdmin && allRiddles.length > 0) {
      // Find previous riddle by order number
      const sortedRiddles = [...allRiddles].sort((a, b) => a.orderNumber - b.orderNumber);
      const currentIndex = sortedRiddles.findIndex(r => r.id === riddleId);
      
      if (currentIndex !== -1 && currentIndex > 0) {
        // Go to previous riddle
        const previousRiddle = sortedRiddles[currentIndex - 1];
        router.push(`/viewriddles?id=${previousRiddle.id}`);
      } else {
        // No previous riddles, go to riddles list
        router.push('/admin/riddles');
      }
    } else {
      // Regular user - go back to dashboard to scan
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-stone-900 overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: 'brightness(0.5) blur(8px)',
          opacity: imageLoaded ? 1 : 0
        }}
      />
      
      {/* Top Navigation - Absolute */}
      <div className="absolute top-0 left-0 z-20 p-4 w-full">
        <button
          onClick={() => router.push(currentUser?.isAdmin ? '/admin/dashboard' : '/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900/40 backdrop-blur-sm text-amber-100 rounded-lg hover:bg-stone-800/60 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className={`relative z-10 w-full max-w-2xl text-center transition-all duration-700 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Admin Controls */}
        {currentUser?.isAdmin && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={handlePreviousRiddle}
              className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 transition-colors shadow-lg"
            >
              <ArrowLeft className="size-4" />
              <span>Prev</span>
            </button>
            
            <button
              onClick={() => router.push(`/admin/riddles/${riddleId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 transition-colors shadow-lg"
            >
              <Edit className="size-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={handleNextRiddle}
              className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600 transition-colors shadow-lg"
            >
              <span>Next</span>
              <ArrowLeft className="size-4 rotate-180" />
            </button>
          </div>
        )}

        {/* Riddle Badge */}
        {currentUser?.isAdmin && (
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-amber-600/90 text-white rounded-full text-sm font-bold border border-amber-400 shadow">
              Riddle {orderNumber}
            </span>
          </div>
        )}

        {/* Simplified Content Display */}
        <div className="px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-12 font-serif tracking-wide drop-shadow-xl">
            {title}
          </h1>

          <div className="space-y-8">
            <div className="text-2xl md:text-4xl leading-relaxed text-amber-50 font-serif italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {riddleContent.split('\n').map((line, index) => (
                <p key={index} className="mb-3">{line}</p>
              ))}
            </div>
            
            <p className="text-amber-200/60 text-sm font-serif mt-8">
              Decipher the ancient riddle...
            </p>

            {/* Scan Button */}
            {!currentUser?.isAdmin && (
              <div className="mt-8">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600/80 hover:bg-amber-500/90 text-white rounded-lg transition-colors font-semibold shadow-lg backdrop-blur-sm"
                >
                  <ScanLine className="size-5" />
                  <span>Scan Another Riddle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiddleTemplate;
