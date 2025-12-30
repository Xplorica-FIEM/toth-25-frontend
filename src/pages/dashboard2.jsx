import { useState, useEffect } from 'react';
import styled from 'styled-components';

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
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
`;

const Button = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  
  color: black;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  user-select: none;
  cursor: pointer;
  
  &:hover {
    border: 1px solid gold;
    border-radius: 15px;
    color: gold;
  }
`;

const Dashboard2 = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMod, setIsMod] = useState(true); // Set to true for mod view

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScan = () => {
    console.log('Scan button clicked!');
  };

  const handleModAction1 = () => {
    console.log('Mod action 1 clicked!');
  };

  const handleModAction2 = () => {
    console.log('Mod action 2 clicked!');
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

        <Overlay>
          <Button onClick={handleScan}>Scan</Button>
          
          {isMod && (
            <>
              <Button onClick={handleModAction1}>Mod Action 1</Button>
              <Button onClick={handleModAction2}>Mod Action 2</Button>
            </>
          )}
        </Overlay>     
    </Wrapper>
  );
};

export default Dashboard2;
