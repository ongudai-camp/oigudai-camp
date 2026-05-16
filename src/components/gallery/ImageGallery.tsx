"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxOpen, goNext, goPrev]);

  useEffect(() => {
    if (!lightboxOpen || !thumbnailRef.current) return;
    const thumb = thumbnailRef.current.children[currentIndex] as HTMLElement;
    if (thumb) {
      thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentIndex, lightboxOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!images || images.length === 0) return null;

  const count = images.length;

  const renderGrid = () => {
    if (count === 1) {
      return (
        <div
          className="col-span-4 row-span-2 cursor-pointer overflow-hidden rounded-2xl relative"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={title ? `${title} - Image 1` : "Gallery image 1"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <>
          {images.slice(0, 2).map((img, i) => (
            <div
              key={i}
              className="col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-2xl relative"
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img}
                alt={title ? `${title} - Image ${i + 1}` : `Gallery image ${i + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 40vw"
                priority={i === 0}
              />
            </div>
          ))}
        </>
      );
    }

    const mainImages = images.slice(0, count >= 4 ? 4 : 3);
    const remaining = count - mainImages.length;

    return (
      <>
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-2xl relative"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={mainImages[0]}
            alt={title ? `${title} - Image 1` : "Gallery image 1"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 40vw"
            priority
          />
        </div>
        <div
          className="cursor-pointer overflow-hidden relative rounded-2xl"
          onClick={() => openLightbox(1)}
        >
          <Image
            src={mainImages[1]}
            alt={title ? `${title} - Image 2` : "Gallery image 2"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 25vw, 20vw"
          />
        </div>
        <div
          className="cursor-pointer overflow-hidden relative rounded-2xl"
          onClick={() => openLightbox(2)}
        >
          <Image
            src={mainImages[2]}
            alt={title ? `${title} - Image 3` : "Gallery image 3"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 25vw, 20vw"
          />
        </div>
        {mainImages[3] && (
          <div
            className="cursor-pointer overflow-hidden relative rounded-2xl"
            onClick={() => openLightbox(3)}
          >
            <Image
              src={mainImages[3]}
              alt={title ? `${title} - Image 4` : "Gallery image 4"}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 25vw, 20vw"
            />
            {remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10">
                <span className="text-white font-bold text-xl">+{remaining}</span>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2 rounded-2xl overflow-hidden h-[250px] sm:h-[320px] md:h-[420px] lg:h-[480px]">
        {renderGrid()}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <button
          onClick={() => openLightbox(0)}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          {title && <span>{title}</span>}
        </button>
        <button
          onClick={() => openLightbox(0)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <span className="text-white/70 text-sm font-mono">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={images[currentIndex]}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <Download size={18} />
              </a>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={22} className="text-white" />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div
            className="flex-1 flex items-center justify-center relative min-h-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <div className="relative w-full h-full max-w-[95vw] max-h-[60vh] sm:max-h-[70vh] px-12 sm:px-16" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[currentIndex]}
                alt={title ? `${title} - Image ${currentIndex + 1}` : `Gallery image ${currentIndex + 1}`}
                fill
                className="object-contain select-none"
                draggable={false}
                sizes="95vw"
                priority
              />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer z-10"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="shrink-0 bg-black/60 py-3">
            <div
              ref={thumbnailRef}
              className="flex gap-2 overflow-x-auto px-4 justify-center"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer relative ${
                    i === currentIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    draggable={false}
                    sizes="(max-width: 768px) 64px, 80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
