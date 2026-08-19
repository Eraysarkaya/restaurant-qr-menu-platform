import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  destroy: vi.fn(async () => ({ result: "ok" })),
  detect: vi.fn(async () => ({ mime: "image/png", ext: "png" })),
  uploadStream: vi.fn((_options: unknown, callback: (error: unknown, result?: { secure_url: string; public_id: string }) => void) => ({
    end: () => callback(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/test.png", public_id: "kose-mutfak/products/test" }),
  })),
}));

vi.mock("cloudinary", () => ({ v2: { config: mocks.config, uploader: { upload_stream: mocks.uploadStream, destroy: mocks.destroy } } }));
vi.mock("file-type", () => ({ fileTypeFromBuffer: mocks.detect }));

import { deleteImage, uploadImage } from "@/server/media/cloudinary";

describe("kontrollü görsel sağlayıcısı", () => {
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    vi.clearAllMocks();
    mocks.detect.mockResolvedValue({ mime: "image/png", ext: "png" });
  });

  it("imzası doğrulanan görseli sunucu adapter'ı üzerinden yükler", async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], "menu.png", { type: "image/png" });
    await expect(uploadImage(file, "products")).resolves.toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/test.png",
      publicId: "kose-mutfak/products/test",
    });
    expect(mocks.detect).toHaveBeenCalledOnce();
    expect(mocks.uploadStream).toHaveBeenCalledOnce();
  });

  it("4 MB üzerindeki dosyayı sağlayıcıya göndermeden reddeder", async () => {
    const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });
    await expect(uploadImage(file, "products")).rejects.toThrow("en fazla 4 MB");
    expect(mocks.uploadStream).not.toHaveBeenCalled();
  });

  it("bildirilen MIME ile dosya imzası eşleşmiyorsa yüklemeyi reddeder", async () => {
    const file = new File([new Uint8Array([137, 80, 78, 71])], "menu.jpg", { type: "image/jpeg" });
    await expect(uploadImage(file, "products")).rejects.toThrow("JPEG, PNG veya WebP");
    expect(mocks.uploadStream).not.toHaveBeenCalled();
  });

  it("uygulama klasörü dışındaki varlıkları silmez", async () => {
    await expect(deleteImage("another-project/image")).rejects.toThrow("Geçersiz görsel kimliği");
    expect(mocks.destroy).not.toHaveBeenCalled();
  });

  it("eski varlığı public id ile temizler", async () => {
    await deleteImage("kose-mutfak/products/old");
    expect(mocks.destroy).toHaveBeenCalledWith("kose-mutfak/products/old", { resource_type: "image", invalidate: true });
  });
});
