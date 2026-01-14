import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link'; // Import Link for prefetching
import { Lock, Unlock, ArrowLeft, CheckCircle, Edit, Scroll, ScanLine } from 'lucide-react';
import { getCurrentUser, getAdminRiddles } from '@/utils/api';

const RiddleTemplate = ({ riddleContent, title, orderNumber, backgroundImage, isAuthenticated, riddleId, onClose }) => {
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(true); // Auto-reveal immediately
  const [currentUser, setCurrentUser] = useState(null);
  const [allRiddles, setAllRiddles] = useState([]);
  const [riddlesLoading, setRiddlesLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // CRITICAL: Show content immediately
    setContentVisible(true);
    
    // Fetch user from API
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.ok && res.data?.user) {
          const user = res.data.user;
          setCurrentUser(user);
          
          // NON-CRITICAL: Fetch all riddles in background if admin
          if (user.isAdmin) {
            fetchRiddles();
          }
        }
      } catch (err) {
        console.error("Failed to fetch user in template", err);
      }
    };
    
    fetchUser();
  }, []);

  // Handle riddle change
  useEffect(() => {
    setImageLoaded(false);
  }, [riddleId]);

  const fetchRiddles = async () => {
    setRiddlesLoading(true);
    try {
      const response = await getAdminRiddles();
      if (response.ok && response.data.riddles) {
        setAllRiddles(response.data.riddles);
      }
    } catch (error) {
      // Silently handle error - admin navigation will be disabled
      console.error('Failed to fetch riddles:', error);
    } finally {
      setRiddlesLoading(false);
    }
  };

  // Next.js Image component handles preloading automatically with priority prop

  // Helper to get background image based on order number
  const getBackgroundImageForOrder = (orderNumber) => {
    // Directly import the static images
    switch (orderNumber) {
      case 1: return '/toth1.png';
      case 2: return '/toth2.png';
      case 3: return '/toth3.png';
      case 4: return '/toth4.png';
      case 5: return '/toth5.png';
      case 6: return '/toth6.png';
      case 7: return '/toth7.png';
      case 8: return '/toth8.png';
      default: return '/toth1.png'; // Default image
    }
  };

  const handleNextRiddle = () => {
    // Don't navigate if riddles are still loading or not loaded
    if (riddlesLoading || allRiddles.length === 0) return;
    
    if (currentUser?.isAdmin) {
      // Find next riddle by order number
      const sortedRiddles = [...allRiddles].sort((a, b) => a.orderNumber - b.orderNumber);
      const currentIndex = sortedRiddles.findIndex(r => r.id === riddleId);
      
      if (currentIndex !== -1 && currentIndex < sortedRiddles.length - 1) {
        // Go to next riddle
        const nextRiddle = sortedRiddles[currentIndex + 1];
        router.push(`/ViewRiddles?id=${nextRiddle.id}`);
      } else {
        // No more riddles, go to riddles list
        router.push('/admin/riddles');
      }
    }
  };

  const handlePreviousRiddle = () => {
    // Don't navigate if riddles are still loading or not loaded
    if (riddlesLoading || allRiddles.length === 0) return;
    
    if (currentUser?.isAdmin) {
      // Find previous riddle by order number
      const sortedRiddles = [...allRiddles].sort((a, b) => a.orderNumber - b.orderNumber);
      const currentIndex = sortedRiddles.findIndex(r => r.id === riddleId);
      
      if (currentIndex !== -1 && currentIndex > 0) {
        // Go to previous riddle
        const previousRiddle = sortedRiddles[currentIndex - 1];
        router.push(`/ViewRiddles?id=${previousRiddle.id}`);
      } else {
        // No previous riddles, go to riddles list
        router.push('/admin/riddles');
      }
    }
  };

  // Helper function to check if a string is a URL
  const isUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      // Also check for common URL patterns without protocol
      return /^(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(trimmed);
    }
  };

  // Helper to render text with URL detection
  const renderTextWithUrls = (text) => {
    const trimmed = text.trim();
    if (isUrl(trimmed)) {
      const href = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      return (
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 hover:text-amber-900 underline decoration-amber-600/50 hover:decoration-amber-800 transition-colors duration-200 break-all"
        >
          {trimmed}
        </a>
      );
    }
    return text;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lazy-loaded Background Image */}
      <Image
        src={getBackgroundImageForOrder(orderNumber)}
        alt="Riddle background"
        layout="fill"
        objectFit="cover"
        quality={75}
        priority={false} // Load after critical content
        loading="lazy" // Defer loading
        className="fixed inset-0 transition-all duration-700 ease-out"
        style={{
          filter: 'blur(0px) brightness(0.7)',
          opacity: imageLoaded ? 1 : 0.3, // Show dim version immediately
          transform: imageLoaded ? 'scale(1)' : 'scale(1.08)',
          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'opacity, transform',
        }}
        onLoadingComplete={() => setImageLoaded(true)}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-linear-to-br from-black/30 via-amber-900/20 to-black/30" />

      {/* Top Navigation - Admin Only */}
      {currentUser?.isAdmin && (
        <div className="relative z-20 p-3 md:p-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-stone-900/80 hover:bg-stone-800/80 backdrop-blur-md text-amber-100 rounded-lg border border-amber-700/30 text-sm md:text-base transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg"
          >
            <ArrowLeft className="size-4 md:size-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 flex items-center justify-center ${currentUser?.isAdmin ? 'min-h-[calc(100vh-80px)]' : 'min-h-screen'} px-3 py-2 md:px-6 md:py-4 transition-all duration-700 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', willChange: 'opacity, transform' }}>
        <div className="w-full max-w-3xl">
          {/* Admin Action Buttons - Top Position for Easy Access */}
          {currentUser?.isAdmin && (
            <div className="flex flex-wrap gap-2 mb-2 justify-center">
              <button
                onClick={handlePreviousRiddle}
                disabled={riddlesLoading || allRiddles.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-lg border border-amber-400/50 text-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ArrowLeft className="size-3" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={() => router.push(`/admin/riddles/edit?id=${riddleId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700/90 hover:bg-purple-600 text-purple-100 rounded-lg font-semibold shadow-lg border border-purple-600 text-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <Edit className="size-3" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleNextRiddle}
                disabled={riddlesLoading || allRiddles.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-lg border border-amber-400/50 text-xs transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>Next</span>
                <ArrowLeft className="size-3 rotate-180" />
              </button>
            </div>
          )}

          {/* Riddle Number Badge - Admin Only */}
          {currentUser?.isAdmin && (
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 backdrop-blur-md rounded-full border-2 border-amber-400/50 shadow-lg">
                <span className="text-white font-bold text-sm">
                  Riddle {orderNumber}
                </span>
              </div>
            </div>
          )}

          {/* Riddle Card */}
          <div className="bg-linear-to-br from-amber-50/95 via-yellow-50/95 to-amber-100/95 backdrop-blur-xl rounded-3xl border-4 border-amber-800/80 shadow-2xl overflow-hidden relative" 
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
            <div className="bg-linear-to-r from-amber-900 via-amber-800 to-amber-900 px-3 py-2 md:px-6 md:py-3 border-b-4 border-amber-950/50 relative">
              {/* Decorative corner flourishes */}
              <div className="absolute top-1 left-1 text-amber-300/30 text-xl md:text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              <div className="absolute top-1 right-1 text-amber-300/30 text-xl md:text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              
              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-amber-50 text-center flex items-center justify-center gap-2" style={{fontFamily: 'Cinzel, serif', letterSpacing: '0.05em'}}>
                <Scroll className="size-5 md:size-6 animate-pulse" />
                {title}
              </h1>
            </div>

            {/* Card Content */}
            <div className="p-3 md:p-6 lg:p-8">
              <div className="space-y-2 md:space-y-3">
                {/* Riddle Content */}
                <div className="bg-amber-100/50 backdrop-blur-sm rounded-2xl p-3 md:p-5 lg:p-6 border-4 border-amber-800/40 shadow-inner relative" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="paper"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23paper)" opacity="0.15" /%3E%3C/svg%3E")',
                  boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.15), inset 0 0 40px rgba(217, 119, 6, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {/* Ancient stain effects */}
                  <div className="absolute top-2 right-4 w-8 h-8 bg-amber-800/5 rounded-full blur-md"></div>
                  <div className="absolute bottom-3 left-6 w-10 h-10 bg-amber-900/5 rounded-full blur-lg"></div>
                  
                  {/* Ornate top decoration */}
                  <div className="absolute top-1 md:top-2 left-1/2 transform -translate-x-1/2 text-amber-900/30 text-base md:text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>✦ ❧ ✦</div>
                  
                  <div className="text-amber-950 text-base md:text-xl lg:text-2xl leading-relaxed text-center space-y-4 mt-4 md:mt-6" style={{fontFamily: 'IM Fell English, serif', fontStyle: 'italic'}}>
                    {(() => {
                      let components = [{ type: 'text', data: riddleContent }];
                      try {
                        if (riddleContent && (riddleContent.startsWith('[') || riddleContent.startsWith('{'))) {
                          const parsed = JSON.parse(riddleContent);
                          if (Array.isArray(parsed)) components = parsed;
                        }
                      } catch (e) {}

                      return components.map((comp, idx) => (
                        <div key={idx} className="animate-fadeIn" style={{ animationDelay: `${idx * 0.15}s` }}>
                          {comp.type === 'image' ? (
                            <div className="my-4 flex justify-center">
                              <img 
                                src={comp.data} 
                                alt="Clue" 
                                className="max-w-full max-h-[40vh] object-contain rounded-lg border-2 border-amber-900/30 shadow-lg"
                              />
                            </div>
                          ) : (
                            comp.data.split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="drop-shadow-sm mb-2 last:mb-0">
                                {renderTextWithUrls(line)}
                              </p>
                            ))
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {/* Ornate bottom decoration */}
                  <div className="absolute bottom-1 md:bottom-2 left-1/2 transform -translate-x-1/2 text-amber-900/30 text-base md:text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>✦ ❧ ✦</div>
                </div>

                {/* Instructions */}
                <p className="text-center text-amber-800/70 text-xs md:text-sm pt-2" style={{fontFamily: 'IM Fell English, serif'}}>
                  Decipher the ancient riddle and continue thy noble quest
                </p>

                {/* Scan Again Button - Shown for all users */}
                <div className="pt-2 md:pt-3">
                  <button
                    onClick={() => onClose ? onClose() : router.push('/dashboard')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg border border-amber-400/50 text-sm md:text-base transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                  >
                    <ScanLine className="size-4 md:size-5" />
                    <span className="hidden sm:inline">Scan Another Riddle</span>
                    <span className="sm:hidden">Scan Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

        .animate-fadeIn {
          animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default RiddleTemplate;
