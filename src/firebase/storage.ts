
'use client';

// This file is no longer used for uploads since switching to Cloudinary.
// It is kept for reference or potential future use with Firebase Storage.
// The new upload logic is in `src/app/settings/profile-image-upload.tsx`
// and `src/app/api/get-upload-signature/route.ts`.

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';

const UPLOAD_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Uploads a file to Firebase Storage with a timeout.
 * @param storage - The Firebase Storage instance.
 * @param file - The file object to upload.
 * @param userId - Optional user ID for namespacing the storage path.
 * @param onProgress - Optional callback to track upload progress (0-100).
 * @returns A promise that resolves with the public URL and storage path of the uploaded file.
 */
export function uploadFileToStorage(
  storage: FirebaseStorage,
  file: File,
  userId: string = 'anon',
  onProgress: (progress: number) => void = () => {}
): Promise<{ url: string; path: string }> {
  if (!file) {
    return Promise.reject(new Error('No file provided for upload.'));
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `uploads/${userId}/${timestamp}_${safeName}`;
  const ref = storageRef(storage, path);

  const uploadTask = uploadBytesResumable(ref, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error('Upload timed out after 30 seconds. Please check your network connection and try again.'));
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(pct));
      },
      (error) => {
        clearTimeout(timeoutId);
        // Don't reject on 'canceled' error if it was due to our timeout
        if (error.code !== 'storage/canceled') {
            reject(error);
        }
      },
      async () => {
        clearTimeout(timeoutId);
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url, path });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
