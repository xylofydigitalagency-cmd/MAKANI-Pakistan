import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  title: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onSelectIndex,
  title,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onSelectIndex((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onSelectIndex((currentIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onSelectIndex]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h4 className="text-sm font-semibold truncate max-w-md">{title}</h4>
          <p className="text-xs text-slate-400">
            Photograph {currentIndex + 1} of {images.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Close fullscreen gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Frame */}
      <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentIndex]}
          alt={`${title} - Photo ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Track */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 p-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelectIndex(i)}
              className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                i === currentIndex ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
