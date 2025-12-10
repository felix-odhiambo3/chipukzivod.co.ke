
'use server';

import { getAdminApp } from '@/lib/firebaseAdmin';
import type { ContactInquiry } from '@/lib/data';
import { firestore } from 'firebase-admin';

/**
 * Sends a multi-channel response to a user's contact inquiry.
 * Currently sends an in-app notification and marks the inquiry as responded.
 *
 * @param contact The original contact inquiry document.
 * @param message The response message from the admin.
 */
export async function sendContactResponse(contact: ContactInquiry, message: string) {
    const adminApp = getAdminApp();
    const adminDb = adminApp.firestore();
    const adminAuth = adminApp.auth();
    let userId: string | null = null;

    // Log tracking for different channels
    const deliveryStatus = {
        notificationStatus: 'pending',
        emailStatus: 'skipped',
        whatsappStatus: 'skipped',
        smsStatus: 'skipped',
        respondedAt: firestore.FieldValue.serverTimestamp(),
        responseMessage: message,
    };

    try {
        // 1. Find user ID from email
        try {
            const userRecord = await adminAuth.getUserByEmail(contact.email);
            userId = userRecord.uid;
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`No registered user found for email ${contact.email}. Skipping in-app notification.`);
                deliveryStatus.notificationStatus = 'skipped_no_user';
            } else {
                throw error; // Re-throw other auth errors
            }
        }

        const batch = adminDb.batch();

        // 2. Send In-App Notification (if user exists)
        if (userId) {
            const notificationRef = adminDb.collection('notifications').doc();
            batch.set(notificationRef, {
                title: `Response to your inquiry about "${contact.service}"`,
                message: message,
                link: '/dashboard', // Or a more specific link
                createdAt: firestore.FieldValue.serverTimestamp(),
                readBy: [], // Initially unread
                userId: userId, // For targeting
            });
            deliveryStatus.notificationStatus = 'success';
        }

        // --- STUB: Future implementation for other channels ---
        // TODO: Implement Email (e.g., using SendGrid, Resend)
        // TODO: Implement WhatsApp (using WhatsApp Cloud API)
        // TODO: Implement SMS (using Africa's Talking API)

        // 3. Update the original contact inquiry with status and logs
        const contactRef = adminDb.collection('contacts').doc(contact.id);
        batch.update(contactRef, {
            status: 'responded',
            deliveryStatus: deliveryStatus, // Log the delivery results
        });
        
        // 4. Commit all Firestore operations
        await batch.commit();

        return { success: true, deliveryStatus };

    } catch (error: any) {
        console.error('Failed to send contact response:', error);
        // Attempt to log the failure back to the contact document
        try {
            const contactRef = adminDb.collection('contacts').doc(contact.id);
            await contactRef.update({
                'deliveryStatus.notificationStatus': `failed: ${error.message}`,
            });
        } catch (logError) {
            console.error('Failed to log error to contact document:', logError);
        }
        
        // Re-throw the original error to be caught by the client
        throw new Error(`Failed to process response: ${error.message}`);
    }
}
