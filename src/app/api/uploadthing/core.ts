import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { z } from 'zod'
import sharp from 'sharp'
import { db } from '@/db'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input

      const res = await fetch(file.url)
      const buffer = await res.arrayBuffer()

      const imgMetadata = await sharp(buffer).metadata()
      const { width, height } = imgMetadata

      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        })

        return { configId: configuration.id }
      } else {
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          data: {
            croppedImageUrl: file.url,
          },
        })

        return { configId: updatedConfiguration.id }
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

// Commenmts
// 1. on file upload we will fetch the image using the file url
// 2. convert it into a buffer using the sharp package to resize the image
// 3. get the metadata of the image(width, height)
// 4. Now remember we said that on upload we will get the configuredId(the image that has been configured, yaani alredy designed in the case)
//  but since we dont have the configuration id onn upload we have to create it in our db which we will use it now in the design process.
// 5. if already configured update the existing configuration cropped image.