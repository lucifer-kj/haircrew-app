"use client";
import { useState } from "react";
import { useCarousel } from "@/lib/useCarousel";
import { Progress } from "@/components/ui/progress";  
import { X } from "lucide-react";
import Image from "next/image";
import { CarouselImage } from "./AdminCarouselControls";

export function Carousel() {
  const { images = [], isLoading } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  if (isLoading) return <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />;
  if (!images.length) return <div className="text-center text-gray-500 py-8">No carousel images found.</div>;

  return (
    <div className="relative">
      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto py-2 px-4">
        {images.map((img: CarouselImage, index: number) => ( 
          <button
            key={img.id}
            onClick={() => {
              setSelectedIndex(index);
              setProgress(0);
            }}
            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
          >
            <Image
              src={img.url}
              alt={img.altText || "Carousel image"}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full max-w-2xl h-[80vh]">
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].altText || "Carousel image"}
              className="w-full h-full object-contain"
            />
            
            <Progress value={progress} className="absolute bottom-4 left-4 right-4" />
          </div>
        </div>
      )}
    </div>
  );
} 