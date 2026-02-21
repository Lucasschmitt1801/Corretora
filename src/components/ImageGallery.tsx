"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";

interface PropertyImage {
  url: string;
  display_order: number | null; // Correção do TypeScript aqui!
}

interface ImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-medium border border-gray-100 shadow-sm">
        Sem fotos disponíveis
      </div>
    );
  }

  // Garante que as imagens estão ordenadas (tratando o null)
  const sortedImages = [...images].sort((a, b) => (a.display_order || 99) - (b.display_order || 99));
  const mainImage = sortedImages[selectedIndex];
  const hasMultipleImages = sortedImages.length > 1;

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % sortedImages.length);
  }, [sortedImages.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  }, [sortedImages.length]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, handleNext, handlePrev]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFullscreen]);


  return (
    <div className="space-y-4 select-none">
      
      <div 
        className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 group cursor-zoom-in"
        onClick={() => setIsFullscreen(true)}
      >
        <img 
          src={mainImage.url} 
          alt={`${title} - Foto Principal`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 p-3 rounded-full text-gray-800 shadow-lg backdrop-blur-sm">
                <Expand size={24} />
            </div>
        </div>

        {hasMultipleImages && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md font-medium">
            {selectedIndex + 1} / {sortedImages.length}
        </div>
      </div>

      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-3">
          {sortedImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                index === selectedIndex 
                  ? 'border-primary shadow-md scale-[1.02]' 
                  : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={img.url} 
                alt={`${title} - Foto ${index + 1}`} 
                className="w-full h-full object-cover"
              />
               {index === selectedIndex && (
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
               )}
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
            onClick={() => setIsFullscreen(false)}
        >
            <button 
                onClick={() => setIsFullscreen(false)}
                className="absolute top-5 right-5 text-white/60 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50"
            >
                <X size={32} />
            </button>

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                <img 
                    src={mainImage.url} 
                    alt={`Visão ampliada ${selectedIndex + 1}`}
                    className="max-w-full max-h-full object-contain shadow-2xl select-none"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {hasMultipleImages && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10 p-3 rounded-full transition-all z-50 hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10 p-3 rounded-full transition-all z-50 hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={48} />
                    </button>
                </>
            )}
            
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                Foto {selectedIndex + 1} de {sortedImages.length}
            </div>
        </div>
      )}

    </div>
  );
}