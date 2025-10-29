'use client';

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
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
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(pct));
      },
      (error) => reject(error),
      async () => {
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
