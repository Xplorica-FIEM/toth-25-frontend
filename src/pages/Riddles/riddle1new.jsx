'use client';
import { useState } from 'react';
import styled, { css } from 'styled-components';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Make sure this image exists in your public folder */
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
  overflow: hidden; /* Keeps the blur edges clean */
  
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

const EnterButton = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  /*border: 1px solid gold;*/
  
  color: black;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    border: 1px solid gold;
    border-radius: 15px;
    color: gold;
  }
`;

const Riddle1 = () => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <Wrapper>
        <BlurWrapper $isRevealed={isRevealed}>
            <PageContainer>
               {/*Riddle goes here*/}
                <div style={{ padding: '35px' }}>
                    <p>I can be cracked, but I have no shell.</p>
                    <p>I can be told, but I have no voice.</p>
                    <p>I can be kept, but I have no locks.</p>
                    <br/>
                    <h3>What am I?</h3>
                </div>
            </PageContainer>
        </BlurWrapper>

        <Overlay
          onClick={handleReveal}
          $isHidden={isRevealed}
        >
          {/* 6. Added the button inside the overlay so you can see what to click */}
          <EnterButton>Click to Reveal</EnterButton>
        </Overlay>     
    </Wrapper>
  );
};

export default Riddle1;