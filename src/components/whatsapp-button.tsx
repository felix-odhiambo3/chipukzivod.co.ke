'use client';

import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  phoneNumber: string; // E.g., '254712345678'
  message?: string;
}

export function WhatsAppButton({ phoneNumber, message }: WhatsAppButtonProps) {
  const url = `https://wa.me/${phoneNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600"
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="h-8 w-8" />
    </Link>
  );
}
