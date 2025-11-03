
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// This API route should be protected in a real-world application
// to ensure only authenticated users can get an upload signature.

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
      console.error('Cloudinary environment variables are not properly configured.');
      return NextResponse.json(
        { error: 'Cloudinary environment variables are not properly configured.' },
        { status: 500 }
      );
    }

    // The signature must be generated on the server-side to keep the API secret secure.
    // The string to sign is `timestamp=${timestamp}${apiSecret}`
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      uploadPreset,
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature.' },
      { status: 500 }
    );
  }
}
