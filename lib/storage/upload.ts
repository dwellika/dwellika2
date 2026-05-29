import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  width?: number
  height?: number
  format?: string
}

export async function uploadFile(
  source: string | Buffer | File,
  options: {
    folder: string
    publicId?: string
    resourceType?: "image" | "video" | "raw" | "auto"
    transformation?: Record<string, unknown>
  },
): Promise<UploadResult> {
  const { folder, publicId, resourceType = "auto" } = options

  let dataUri: string

  if (source instanceof File) {
    const buffer = Buffer.from(await source.arrayBuffer())
    dataUri = `data:${source.type};base64,${buffer.toString("base64")}`
  } else if (source instanceof Buffer) {
    dataUri = `data:application/octet-stream;base64,${source.toString("base64")}`
  } else {
    dataUri = source as string
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    overwrite: !!publicId,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  }
}

export async function deleteFile(publicId: string, resourceType: "image" | "video" | "raw" = "image"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, {
    folder: "dwellika/avatars",
    publicId: `avatar_${userId}`,
    resourceType: "image",
  })
}

export async function uploadCover(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, {
    folder: "dwellika/covers",
    publicId: `cover_${userId}`,
    resourceType: "image",
  })
}

export async function uploadArtwork(file: File, artworkId: string, position: number): Promise<UploadResult> {
  return uploadFile(file, {
    folder: "dwellika/artworks",
    publicId: `artwork_${artworkId}_${position}`,
    resourceType: "image",
  })
}

export async function uploadChatAttachment(file: File, chatId: string, userId: string): Promise<UploadResult> {
  return uploadFile(file, {
    folder: `dwellika/chat/${chatId}`,
    publicId: `${userId}_${Date.now()}`,
    resourceType: "auto",
  })
}
