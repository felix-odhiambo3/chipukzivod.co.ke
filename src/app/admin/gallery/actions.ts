
'use server';

import { getAdminApp } from '@/lib/firebaseAdmin';
import { revalidatePath } from 'next/cache';

const adminDb = getAdminApp().firestore();

interface UpdateMediaData {
    title: string;
    caption?: string;
}

export async function updateMedia(mediaId: string, data: UpdateMediaData) {
    try {
        const mediaRef = adminDb.collection('gallery').doc(mediaId);
        await mediaRef.update({
            title: data.title,
            caption: data.caption || '',
            updatedAt: adminDb.FieldValue.serverTimestamp()
        });
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMedia(mediaId: string) {
    try {
        // TODO: Also delete the file from Cloudinary if needed
        const mediaRef = adminDb.collection('gallery').doc(mediaId);
        await mediaRef.delete();
        revalidatePath('/admin/gallery');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleMediaStatus(mediaId: string, currentStatus: 'published' | 'draft') {
    try {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const mediaRef = adminDb.collection('gallery').doc(mediaId);
        await mediaRef.update({
            status: newStatus,
            updatedAt: adminDb.FieldValue.serverTimestamp()
        });
        revalidatePath('/admin/gallery');
        revalidatePath('/gallery');
        return { success: true, newStatus };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
