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
  background-image: url('${props => props.$background}'); 
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
  
  transition: filter 0.8s ease-in-out, transform 0.8s ease-in-out;
  
  ${props => props.$isRevealed ? css`
    filter: blur(0px);
    transform: scale(1);
    pointer-events: auto;
  ` : css`
    filter: blur(20px);
    transform: scale(1.05);
    pointer-events: none;
    user-select: none;
  `}
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

  transition: opacity 0.5s ease-in-out, visibility 0.5s;

  ${props => props.$isHidden ? css`
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
  `: css`
      opacity: 1;
      visibility: visible;
  `}
`;

const shakeAnimation = css`
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
`;

const EnterButton = styled.button`
  ${shakeAnimation}
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;

  user-select: none;        /* Prevents text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  outline: none;  /* Remove default */
  &:focus {
    border: 2px solid gold;  /* Custom focus style */
  }
  
  cursor: pointer;
  
  
  color: black;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border: 1px solid gold;
    border-radius: 15px;
    color: gold;
  }

  ${props => props.$showError ? css`
    animation: shake 0.5s;
    &:hover {
      color: red;
      border: 1px solid red;
      border-radius: 15px;
    }
  ` : ''}
`;

const span=styled.span`
  color: red;
`;

const RiddleTemplate = ({ riddleContent,title, backgroundImage, isAuthenticated }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReveal = () => {
    if (!isAuthenticated) {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      return;
    }
    setIsRevealed(true);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Wrapper>
        <BlurWrapper $isRevealed={isRevealed}>
            <PageContainer $background={backgroundImage}>
                <div style={{ padding: '35px' }}>
                    {riddleContent}
                     <EnterButton >Scan Again</EnterButton>
                </div>
            </PageContainer>
        </BlurWrapper>

        <Overlay
          onClick={handleReveal}
          $isHidden={isRevealed}
        >
          <EnterButton $showError={showError}>Click to Reveal</EnterButton>
        </Overlay>     
    </Wrapper>
  );
};

export default RiddleTemplate;
