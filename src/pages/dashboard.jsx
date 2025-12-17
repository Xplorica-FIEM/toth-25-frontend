import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

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
  color: #333;
  font-family: Fantasy, fantasy;
  font-size: 32px;
  text-align: center;
  border-radius: 3px; 
`;

const BlurWrapper = styled.div`
  width: 100%;
  height: 100vh; 
  overflow: hidden;
  filter: blur(10px);
  transform: scale(1.05);
  pointer-events: none;
  user-select: none;
`;

const Wrapper = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3); 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

`;

const ScanButton = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  
  color: black;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  user-select: none;
  
  &:hover {
    border: 1px solid gold;
    border-radius: 15px;
    color: gold;
  }
`;

const Dashboard = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScan = () => {
    // Add your scan logic here
    console.log('Scan button clicked!');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Wrapper>
        <BlurWrapper>
            <PageContainer>
            </PageContainer>
        </BlurWrapper>

        <Overlay
          onClick={handleScan}
        >
          <ScanButton>Scan</ScanButton>
        </Overlay>     
    </Wrapper>
  );
};

export default Dashboard;
