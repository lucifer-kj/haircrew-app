import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 5,
      // Accept is not a valid property here; file type is inferred from 'image'
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
