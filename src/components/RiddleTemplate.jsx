import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, Unlock, ArrowLeft, CheckCircle, Edit, Scroll, ScanLine } from 'lucide-react';
import { getUser } from '@/utils/auth';
import { getAdminRiddles } from '@/utils/api';

const RiddleTemplate = ({ riddleContent, title, orderNumber, backgroundImage, isAuthenticated, riddleId }) => {
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(true); // Auto-reveal immediately
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: 'blur(0px) brightness(0.7)',
          opacity: imageLoaded ? 1 : 0,
          transform: imageLoaded ? 'scale(1)' : 'scale(1.08)',
          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'opacity, transform',
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-amber-900/20 to-black/30" />

      {/* Top Navigation */}
      <div className="relative z-20 p-3 md:p-6">
        <button
          onClick={() => router.push(currentUser?.isAdmin ? '/admin/dashboard' : '/dashboard')}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-stone-900/80 hover:bg-stone-800/80 backdrop-blur-md text-amber-100 rounded-lg border border-amber-700/30 text-sm md:text-base transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg"
        >
          <ArrowLeft className="size-4 md:size-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-3 py-4 md:px-6 md:py-8 transition-all duration-700 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', willChange: 'opacity, transform' }}>
        <div className="w-full max-w-4xl">
          {/* Admin Action Buttons - Top Position for Easy Access */}
          {currentUser?.isAdmin && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              <button
                onClick={handlePreviousRiddle}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-lg border border-amber-400/50 text-sm transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="size-4" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => router.push(`/admin/riddles/${riddleId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-700/90 hover:bg-purple-600 text-purple-100 rounded-lg font-semibold shadow-lg border border-purple-600 text-sm transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <Edit className="size-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleNextRiddle}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-lg border border-amber-400/50 text-sm transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Next</span>
                <ArrowLeft className="size-4 rotate-180" />
              </button>
            </div>
          )}

          {/* Riddle Number Badge - Admin Only */}
          {currentUser?.isAdmin && (
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-amber-600/90 backdrop-blur-md rounded-full border-2 border-amber-400/50 shadow-lg">
                <span className="text-white font-bold text-base md:text-lg">
                  Riddle {orderNumber}
                </span>
              </div>
            </div>
          )}

          {/* Riddle Card */}
          <div className="bg-gradient-to-br from-amber-50/95 via-yellow-50/95 to-amber-100/95 backdrop-blur-xl rounded-3xl border-4 border-amber-800/80 shadow-2xl overflow-hidden relative" 
            style={{
              transform: contentVisible ? 'scale(1)' : 'scale(0.95)',
              opacity: contentVisible ? 1 : 0,
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform, opacity',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" /%3E%3CfeColorMatrix type="saturate" values="0.1"/%3E%3C/filter%3E%3Crect width="200" height="200" filter="url(%23noise)" opacity="0.4" fill="%23d4a574"/%3E%3C/svg%3E"), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 92, 46, 0.03) 2px, rgba(139, 92, 46, 0.03) 3px)', 
            backgroundSize: '200px 200px, 100% 100%', 
            backgroundBlend: 'multiply',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px 0 rgba(255, 255, 255, 0.1), 0 0 80px rgba(217, 119, 6, 0.3)'
          }}>
            {/* Ancient decorative corners */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-amber-700/40 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-amber-700/40 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-amber-700/40 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-amber-700/40 rounded-br-3xl"></div>
            
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-4 py-4 md:px-8 md:py-6 border-b-4 border-amber-950/50 relative">
              {/* Decorative corner flourishes */}
              <div className="absolute top-2 left-2 text-amber-300/30 text-2xl md:text-4xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              <div className="absolute top-2 right-2 text-amber-300/30 text-2xl md:text-4xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-amber-50 text-center flex items-center justify-center gap-2 md:gap-3" style={{fontFamily: 'Cinzel, serif', letterSpacing: '0.05em'}}>
                <Scroll className="size-6 md:size-8 animate-pulse" />
                {title}
              </h1>
            </div>

            {/* Card Content */}
            <div className="p-4 md:p-8 lg:p-12">
              <div className="space-y-3 md:space-y-5">
                {/* Riddle Content */}
                <div className="bg-amber-100/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 lg:p-10 border-4 border-amber-800/40 shadow-inner relative" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="paper"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23paper)" opacity="0.15" /%3E%3C/svg%3E")',
                  boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.15), inset 0 0 40px rgba(217, 119, 6, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* Ancient stain effects */}
                  <div className="absolute top-4 right-8 w-12 h-12 bg-amber-800/5 rounded-full blur-md"></div>
                  <div className="absolute bottom-6 left-12 w-16 h-16 bg-amber-900/5 rounded-full blur-lg"></div>
                  
                  {/* Ornate top decoration */}
                  <div className="absolute top-2 md:top-3 left-1/2 transform -translate-x-1/2 text-amber-900/30 text-xl md:text-3xl" style={{fontFamily: 'Uncial Antiqua'}}>✦ ❧ ✦</div>
                  
                  <div className="text-amber-950 text-lg md:text-2xl lg:text-3xl leading-relaxed text-center space-y-3 md:space-y-4 mt-6 md:mt-8" style={{fontFamily: 'IM Fell English, serif', fontStyle: 'italic'}}>
                    {riddleContent.split('\n').map((line, index) => (
                      <p key={index} className="animate-fadeIn drop-shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {/* Ornate bottom decoration */}
                  <div className="absolute bottom-2 md:bottom-3 left-1/2 transform -translate-x-1/2 text-amber-900/30 text-xl md:text-3xl" style={{fontFamily: 'Uncial Antiqua'}}>✦ ❧ ✦</div>
                </div>

                {/* Instructions */}
                <p className="text-center text-amber-800/70 text-sm md:text-base pt-4" style={{fontFamily: 'IM Fell English, serif'}}>
                  Decipher the ancient riddle and continue thy noble quest
                </p>

                {/* User Scan Again Button - Shown only for non-admin users */}
                {!currentUser?.isAdmin && (
                  <div className="pt-4 md:pt-6">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg border border-amber-400/50 text-sm md:text-base transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                    >
                      <ScanLine className="size-4 md:size-5" />
                      <span className="hidden sm:inline">Scan Another Riddle</span>
                      <span className="sm:hidden">Scan Again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RiddleTemplate;
