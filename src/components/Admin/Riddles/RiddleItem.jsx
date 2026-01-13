import React from "react";
import { Download, Edit, Eye, Trash2 } from "lucide-react";

const RiddleItem = ({ riddle, onEdit, onDownload, onView, onDelete }) => {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-4 hover:border-amber-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <span className="text-base sm:text-lg font-semibold text-amber-100">
            {riddle.riddleName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button onClick={() => onEdit(riddle.id)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors">
            <Edit className="size-5 sm:size-4" />
            <span className="hidden sm:inline">edit</span>
          </button>
          <button onClick={() => onDownload(riddle)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors">
            <Download className="size-5 sm:size-4" />
            <span className="hidden sm:inline">Download QR</span>
          </button>
          <button onClick={() => onView(riddle.id)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors whitespace-nowrap">
            <Eye className="size-5 sm:size-4" />
            <span className="hidden sm:inline">view riddles</span>
          </button>
          <button onClick={() => onDelete(riddle.id)} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors">
            <Trash2 className="size-5 sm:size-4" />
            <span className="hidden sm:inline">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiddleItem;