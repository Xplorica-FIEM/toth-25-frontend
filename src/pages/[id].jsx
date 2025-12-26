import { useState } from 'react';
import { useRouter } from 'next/router';
import RiddleTemplate from '../components/RiddleTemplate';
import { riddles, verifyRiddleKey } from '../data/riddles';

const RiddlePage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Find the riddle by id
  const riddle = riddles.find(r => r.id === parseInt(id));

  // If riddle not found, show error
  if (!riddle && id) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Fantasy, fantasy',
        fontSize: '24px'
      }}>
        Riddle not found
      </div>
    );
  }

  // Show loading while router is initializing
  if (!riddle) {
    return null;
  }

  return (
    <RiddleTemplate 
      riddleContent={riddle.content}
      backgroundImage={riddle.background}
      isAuthenticated={riddle.isAuthenticated}
    />
  );
};

export default RiddlePage;
