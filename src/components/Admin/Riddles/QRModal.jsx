import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

const QRModal = ({ isOpen, onClose, riddle, onError }) => {
  const [qrPreviewUrl, setQrPreviewUrl] = useState("");
  const [qrSize, setQrSize] = useState(300);

  useEffect(() => {
    if (isOpen && riddle) {
      generatePreview();
    }
  }, [isOpen, riddle]);

  const generatePreview = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = `${riddle.id}:${riddle.encryptionSecret || ''}`;
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      setQrPreviewUrl(url);
    } catch (err) {
      onError("Failed to generate QR preview");
    }
  };

  const handleDownload = async () => {
    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = `${riddle.id}:${riddle.encryptionSecret || ''}`;
      const url = await QRCode.toDataURL(qrData, {
        width: Math.max(10, Math.min(3000, qrSize)),
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      const link = document.createElement('a');
      link.href = url;
      link.download = `${riddle.riddleName.replace(/\s+/g, '-')}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } catch (err) {
      onError("Failed to download QR code");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-stone-400 hover:text-white p-1 hover:bg-stone-800 rounded-full transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-amber-100 mb-6 flex items-center gap-2">
            <Download className="size-5 text-amber-500" /> Download QR Code
        </h3>
        <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-3 rounded-lg shadow-inner border border-stone-700">
                <img src={qrPreviewUrl} alt="QR Preview" className="w-48 h-48 object-contain" />
            </div>
            <div className="w-full space-y-3">
                <label className="text-sm text-stone-400 flex justify-between items-end">
                    <span>Image Size</span>
                    <span className="text-amber-400 font-mono text-xs bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/50">
                      {qrSize}px
                    </span>
                </label>
                <div className="flex gap-4 items-center">
                    <input type="range" min="10" max="3000" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="flex-1 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                    <input type="number" min="10" max="3000" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="w-20 bg-stone-800 border border-stone-700 text-stone-200 rounded-md px-2 py-1.5 text-sm text-center focus:border-amber-500 outline-none font-mono" />
                </div>
            </div>
            <button onClick={handleDownload} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg">
                <Download className="size-4" /> Download PNG
            </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;