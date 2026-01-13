import React, { useState } from 'react';
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import ViewRiddleToUser from './ViewRiddle';

const Scan = dynamic(() => import("../scan"), { ssr: false });

const ScannerModal = ({ onClose }) => {
  const [unlockedRiddleId, setUnlockedRiddleId] = useState(null);

  // If a riddle was successfully scanned, show the ViewRiddleToUser component
  if (unlockedRiddleId) {
    return (
      <ViewRiddleToUser 
        riddleId={unlockedRiddleId} 
        onClose={onClose} // Closing the riddle view closes the whole modal logic
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full h-full max-w-4xl">
        <button onClick={onClose} className="absolute top-2 right-2 z-50 bg-red-600 text-white rounded-full p-2">
          <X className="w-6 h-6" />
        </button>
        <Scan 
          onClose={onClose} 
          onScanSuccess={(id) => setUnlockedRiddleId(id)} 
        />
      </div>
    </div>
  );
};

export default ScannerModal;