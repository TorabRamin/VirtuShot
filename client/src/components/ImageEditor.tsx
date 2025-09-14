import React, { useState, useMemo, useCallback } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';

interface ImageEditorProps {
  imageUrl: string;
  onClose: () => void;
}

const ControlSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; }> = ({ label, value, onChange, min = 0, max = 200 }) => (
  <div>
    <label className="flex justify-between text-sm font-medium text-gray-700">
      <span>{label}</span>
      <span>{value}%</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%)`,
      }}
    />
  </div>
);

// Custom hook for managing state with undo/redo functionality
const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = useCallback((action: T | ((prevState: T) => T)) => {
    const currentState = history[index];
    const newState = typeof action === 'function' 
      ? (action as (prevState: T) => T)(currentState) 
      : action;

    if (JSON.stringify(newState) === JSON.stringify(currentState)) {
      return;
    }

    const newHistory = history.slice(0, index + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  }, [index, history.length]);

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};


export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onClose }) => {
  const initialFilters = useMemo(() => ({ brightness: 100, contrast: 100, saturation: 100 }), []);
  const { 
    state: filters, 
    setState: setFilters, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialFilters);

  const [aspectRatio, setAspectRatio] = useState('original');

  const imageStyle = useMemo(() => ({
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`,
  }), [filters]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters, setFilters]);

  const handleDownload = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { naturalWidth: w, naturalHeight: h } = img;
      let sx = 0, sy = 0, sWidth = w, sHeight = h;

      // Calculate cropping dimensions
      if (aspectRatio === '1:1') {
        if (w > h) { sWidth = h; sx = (w - h) / 2; } 
        else { sHeight = w; sy = (h - w) / 2; }
      } else if (aspectRatio === '4:3') {
        const targetRatio = 4 / 3;
        if (w / h > targetRatio) { sWidth = h * targetRatio; sx = (w - sWidth) / 2; } 
        else { sHeight = w / targetRatio; sy = (h - sHeight) / 2; }
      } else if (aspectRatio === '3:4') {
        const targetRatio = 3 / 4;
        if (w / h < targetRatio) { sHeight = w / targetRatio; sy = (h - sHeight) / 2; } 
        else { sWidth = h * targetRatio; sx = (w - sWidth) / 2; }
      }

      canvas.width = sWidth;
      canvas.height = sHeight;

      ctx.filter = imageStyle.filter;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

      const link = document.createElement('a');
      link.download = 'virtushot-edited-shot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imageUrl;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Edit Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 min-h-0">
          <div className="md:col-span-2 bg-gray-100 p-4 flex items-center justify-center overflow-auto">
            <img src={imageUrl} alt="Editing preview" style={imageStyle} className="max-w-full max-h-full object-contain" />
          </div>

          <aside className="md:col-span-1 p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Adjustments</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                    aria-label="Undo"
                    title="Undo"
                  >
                    <UndoIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                    aria-label="Redo"
                    title="Redo"
                  >
                    <RedoIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <ControlSlider label="Brightness" value={filters.brightness} onChange={(e) => setFilters(f => ({ ...f, brightness: parseInt(e.target.value) }))} />
                <ControlSlider label="Contrast" value={filters.contrast} onChange={(e) => setFilters(f => ({ ...f, contrast: parseInt(e.target.value) }))} />
                <ControlSlider label="Saturation" value={filters.saturation} onChange={(e) => setFilters(f => ({ ...f, saturation: parseInt(e.target.value) }))} />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Export Options</h3>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Aspect Ratio</p>
                <div className="flex flex-wrap gap-2">
                  {['original', '1:1', '4:3', '3:4'].map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {ratio === '1:1' ? 'Square' : ratio.charAt(0).toUpperCase() + ratio.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-auto flex-shrink-0 space-y-3 pt-6">
               <button 
                onClick={resetFilters}
                className="w-full text-center bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Adjustments
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <DownloadIcon className="w-5 h-5" />
                Download Edited Image
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};