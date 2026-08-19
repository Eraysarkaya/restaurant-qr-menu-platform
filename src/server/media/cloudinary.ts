import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";

export type UploadedImage = {
  url: string;
  publicId: string;
};

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary ayarları eksik. Görsel yüklemek için ortam değişkenlerini tamamlayın.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

type MediaFolder = "brand" | "categories" | "hero" | "products";

export async function uploadImage(file: File, folder: MediaFolder): Promise<UploadedImage> {
  if (file.size === 0) throw new Error("Boş dosya yüklenemez.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Görsel en fazla 4 MB olabilir.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const declaredTypeAllowed = ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]);
  const detectedTypeAllowed = detected && ACCEPTED_IMAGE_TYPES.includes(detected.mime as (typeof ACCEPTED_IMAGE_TYPES)[number]);
  if (!declaredTypeAllowed || !detectedTypeAllowed || detected.mime !== file.type) {
    throw new Error("Yalnızca gerçek JPEG, PNG veya WebP görseller yüklenebilir.");
  }

  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `kose-mutfak/${folder}`,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
        transformation: [{ width: 1800, height: 1800, crop: "limit", quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error("Görsel yüklenemedi. Lütfen tekrar deneyin."));
          return;
        }
        if (!result.secure_url.startsWith("https://res.cloudinary.com/") || !result.public_id.startsWith(`kose-mutfak/${folder}/`)) {
          reject(new Error("Görsel sağlayıcısından geçersiz bir yanıt alındı."));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId?: string | null) {
  if (!publicId) return;
  if (!publicId.startsWith("kose-mutfak/") || publicId.length > 255) {
    throw new Error("Geçersiz görsel kimliği.");
  }
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}
