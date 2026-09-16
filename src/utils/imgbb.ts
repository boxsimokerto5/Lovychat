import { compressImageFile } from './avatars';

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  thumbUrl?: string;
  deleteUrl?: string;
  isImgBB: boolean;
}

/**
 * Returns whether an ImgBB API key has been configured in the environment or storage.
 */
export function isImgBBConfigured(): boolean {
  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  const storageKey = typeof window !== 'undefined' ? localStorage.getItem('lovychat_imgbb_key') : null;
  return Boolean((storageKey || envKey || '').trim());
}

/**
 * Uploads an image to ImgBB or provides compressed local representation.
 * If no key is configured or the network request fails, it gracefully falls back
 * to a locally compressed JPEG data-URL so users never experience a broken flow.
 */
export async function uploadImageToImgBB(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<ImgBBUploadResult> {
  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  const storageKey = typeof window !== 'undefined' ? localStorage.getItem('lovychat_imgbb_key') : null;
  const apiKey = (storageKey || envKey || '').trim();

  // If ImgBB key is provided, perform remote upload
  if (apiKey) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return {
            url: json.data.url,
            displayUrl: json.data.display_url || json.data.url,
            thumbUrl: json.data.thumb?.url || json.data.url,
            deleteUrl: json.data.delete_url,
            isImgBB: true
          };
        }
      }
      console.warn('ImgBB API response was not successful:', res.status);
    } catch (err) {
      console.warn('ImgBB upload error, falling back to local compression:', err);
    }
  }

  // Graceful fallback: Compress image to small data URL
  const compressedDataUrl = await compressImageFile(
    file,
    options?.maxWidth || 800,
    options?.maxHeight || 800,
    options?.quality || 0.7
  );

  return {
    url: compressedDataUrl,
    displayUrl: compressedDataUrl,
    isImgBB: false
  };
}
