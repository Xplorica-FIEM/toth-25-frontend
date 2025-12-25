import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ScanLine, Scroll, Users, Compass } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// --- NEW: Dynamic Import from Context 3 ---
const Scan = dynamic(() => import("../components/scan"), {
  ssr: false,
});

/* --- ANIMATIONS --- */
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

/* --- STYLED COMPONENTS --- */

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('/toth3.png'); 
  background-size: cover;
  background-position: center;
  font-family: 'Cinzel', Fantasy, serif;
`;

const BlurWrapper = styled.div`
  width: 100%;
  height: 100vh; 
  overflow: hidden;
  filter: blur(8px) brightness(0.6); 
  transform: scale(1.05);
  pointer-events: none;
  user-select: none;
  position: absolute;
  inset: 0;
`;

const Wrapper = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0c0a09;
`;

const Overlay = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  color: #FEF3C7; /* amber-100 */
  animation: ${float} 6s ease-in-out infinite;
  user-select: none;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    margin-top: 1rem;
    text-shadow: 0 4px 12px rgba(0,0,0,0.5);
    letter-spacing: 2px;
  }

  svg {
    color: #FBBF24; /* amber-400 */
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
  }

  p {
    margin-top: 0.5rem;
    font-size: 1rem;
    opacity: 0.8;
  }
`;

const Button = styled.button`
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem 2rem;

  /* Typography */
  font-family: inherit;
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #FEF3C7;

  /* Visuals */
  background: linear-gradient(135deg, rgba(66, 32, 6, 0.85), rgba(28, 25, 23, 0.9));
  border: 1px solid rgba(180, 83, 9, 0.4);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);

  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(180, 83, 9, 0.2);
    padding: 0.75rem;
    border-radius: 10px;
    color: #FBBF24;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: #FBBF24;
    box-shadow: 0 12px 40px rgba(251, 191, 36, 0.15);
    background: linear-gradient(135deg, rgba(120, 53, 15, 0.9), rgba(41, 37, 36, 0.95));

    .icon-box {
      background: rgba(251, 191, 36, 0.2);
      color: #FFF;
    }
  }

  &:active {
    transform: translateY(0px);
  }
`;

const Dashboard = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMod, setIsMod] = useState(true);

  // --- NEW: Scanner State ---
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- NEW: Handler opens state instead of console log ---
  const handleScan = () => {
    setShowScanner(true);
  };

  const handleModAction1 = () => {
    router.push('/riddle-list');
  };

  const handleModAction2 = () => {
    router.push('/users');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Wrapper>
        <BlurWrapper>
            <PageContainer />
        </BlurWrapper>

        <Overlay>
          <Header>
            <Compass size={48} className="animate-pulse" />
            <h1>Dashboard</h1>
            <p className="text-amber-100/80 max-w-2xl mx-auto">
              Scan ancient QR codes and solve riddles  uncover hidden secrets.
            </p>
          </Header>

          <Button onClick={handleScan}>
            <div className="icon-box"><ScanLine size={24} /></div>
            Scan QR
          </Button>

          {isMod && (
            <>
              <Button onClick={handleModAction1}>
                <div className="icon-box"><Scroll size={24} /></div>
                Riddle List
              </Button>
              <Button onClick={handleModAction2}>
                <div className="icon-box"><Users size={24} /></div>
                User List
              </Button>
            </>
          )}
        </Overlay>

        {/* --- NEW: Scanner Component Rendered Here --- */}
        {showScanner && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
            <Scan onClose={() => setShowScanner(false)} />
          </div>
        )}
    </Wrapper>
  );
};

export default Dashboard;