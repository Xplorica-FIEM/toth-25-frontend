import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "info" // "success", "warning", "error", "info"
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="size-12 text-green-400" />;
      case "warning":
      case "error":
        return <AlertTriangle className="size-12 text-red-400" />;
      default:
        return <CheckCircle className="size-12 text-amber-400" />;
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "warning":
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-amber-600 hover:bg-amber-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl border-2 border-amber-700/50 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-stone-700 rounded-lg transition-colors"
        >
          <X className="size-5 text-amber-200/60" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-amber-100 text-center mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-amber-200/80 text-center mb-6 text-sm md:text-base">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${getButtonColors()} text-white rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
