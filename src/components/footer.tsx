
import Link from 'next/link';
import { Logo } from './logo';
import { Youtube, Instagram, Linkedin } from 'lucide-react';

const TwitterIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
)

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Chipukizi VOD Worker Cooperative. Empowering creative professionals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/events" className="text-muted-foreground hover:text-primary">Events</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary">Services</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Member Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="https://x.com/drama_voice?t=WSBdb8YGtaBdasNwWZdnSg&s=08" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><TwitterIcon /></a>
              <a href="https://www.youtube.com/watch?v=6UN8Tg-71Hg" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Youtube /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Instagram /></a>
              <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Chipukizi VOD Cooperative Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
