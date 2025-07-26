# Photo Carousel System Implementation Guide

Based on your package.json, you're using Next.js with Prisma, Tailwind CSS, and already have some UI components like Radix UI and Embla Carousel. Here's a step-by-step guide to implement the admin-controlled photo carousel system:

## 1. Database Setup

First, extend your Prisma schema to store carousel images:

```prisma
// prisma/schema.prisma
model CarouselImage {
  id          String   @id @default(cuid())
  url         String   // URL from UploadThing or your storage
  altText     String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String   // User ID who uploaded it
}
```

Run `npx prisma generate` to update your Prisma Client.

## 2. Backend API

Create API routes for carousel operations:

```typescript
// pages/api/carousel/index.ts
import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (req.method === "GET") {
    // Public access to get all carousel images
    const images = await prisma.carouselImage.findMany({
      orderBy: { order: "asc" },
    });
    return res.json(images);
  }

  if (!session?.user.isAdmin) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    // Admin-only upload
    const { url, altText } = req.body;
    const image = await prisma.carouselImage.create({
      data: {
        url,
        altText: altText || "",
        createdBy: session.user.id,
      },
    });
    return res.json(image);
  }

  if (req.method === "DELETE") {
    // Admin-only delete
    const { id } = req.query;
    await prisma.carouselImage.delete({
      where: { id: id as string },
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return res.status(405).end("Method not allowed");
}
```

## 3. Frontend Components

### Carousel Component:

```typescript
// components/Carousel.tsx
"use client";
import { useState } from "react";
import { useCarousel } from "@/hooks/useCarousel";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function Carousel() {
  const { images, isLoading } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  if (isLoading) return <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />;
  if (!images.length) return null;

  return (
    <div className="relative">
      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto py-2 px-4">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => {
              setSelectedIndex(index);
              setProgress(0);
            }}
            className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
          >
            <img
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
            <img
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
```

### Admin Upload Component:

```typescript
// components/AdminCarouselControls.tsx
"use client";
import { useSession } from "next-auth/react";
import { useCarousel } from "@/hooks/useCarousel";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export function AdminCarouselControls() {
  const { data: session } = useSession();
  const { images, mutate } = useCarousel();

  if (!session?.user.isAdmin) return null;

  const handleDelete = async (id: string) => {
    await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div className="mb-4">
      <UploadButton<OurFileRouter>
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
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.url}
              alt={img.altText}
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
```

## 4. Custom Hook

```typescript
// hooks/useCarousel.ts
import useSWR from "swr";

export function useCarousel() {
  const { data, error, mutate } = useSWR("/api/carousel", (url) =>
    fetch(url).then((res) => res.json())
  );

  return {
    images: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
}
```

## 5. Implementation Steps

1. **Set up UploadThing** (you already have it in dependencies):
   - Create `app/api/uploadthing/core.ts` with your upload configuration
   - Configure your UploadThing dashboard with an "imageUploader" endpoint

2. **Add the components to your page**:
   ```typescript
   // app/page.tsx or wherever you want the carousel
   import { Carousel } from "@/components/Carousel";
   import { AdminCarouselControls } from "@/components/AdminCarouselControls";

   export default function Home() {
     return (
       <div>
         {/* Your existing content */}
         <AdminCarouselControls />
         <Carousel />
       </div>
     );
   }
   ```

3. **Add Tailwind styles** (add to your globals.css if needed):
   ```css
   @keyframes progress {
     from { width: 0%; }
     to { width: 100%; }
   }

   .animate-progress {
     animation: progress 5s linear forwards;
   }
   ```

## 6. Security Considerations

1. **Authentication**:
   - Ensure your NextAuth configuration properly checks `user.isAdmin`
   - Add server-side validation for all API routes

2. **Upload Security**:
   - Configure UploadThing to only accept image files
   - Set reasonable size limits
   - Consider adding image moderation if needed

3. **Database**:
   - Add indexes to the CarouselImage model for performance
   - Consider soft deletes instead of hard deletes if needed

## 7. Mobile Optimization

The implementation already includes:
- Responsive grid for admin thumbnails
- Touch-friendly controls
- Full-screen viewer that works on mobile
- Horizontal scrolling for the thumbnail strip

## 8. Testing

1. Test as both admin and regular user
2. Verify uploads work correctly
3. Check that the carousel progresses automatically
4. Test on mobile devices

## Troubleshooting

If you encounter issues:
1. Check browser console and network tabs
2. Verify Prisma migrations ran (`npx prisma migrate dev`)
3. Ensure UploadThing is properly configured
4. Confirm your NextAuth session includes the `isAdmin` flag

This implementation gives you a secure, responsive photo carousel with admin controls that fits your existing tech stack. The components are modular so you can easily adjust styling or behavior as needed.