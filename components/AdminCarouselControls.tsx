"use client";
import { useSession } from "next-auth/react";
import { useCarousel } from "@/lib/useCarousel";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";
import Image from "next/image";

// TypeScript type for carousel images
export type CarouselImage = {
  id: string;
  url: string;
  altText?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export function AdminCarouselControls() {
  const { data: session } = useSession();
  const { images, mutate } = useCarousel();

  if (!session?.user?.role || session.user.role !== "ADMIN") return null;

  const handleDelete = async (id: string) => {
    await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div className="mb-4">
      <UploadButton<OurFileRouter, "imageUploader">
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (res) {
            fetch("/api/carousel", {
              method: "POST",
              body: JSON.stringify({
                url: res[0].url,
                altText: res[0].name,
              }),
            }).then(() => mutate());
          }
        }}
      />
      <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
        {images.map((img: CarouselImage) => (
          <div key={img.id} className="relative group">
            <Image
              src={img.url}
              alt={img.altText || "Carousel Image"}
              className="w-full h-20 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
              onClick={() => handleDelete(img.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 