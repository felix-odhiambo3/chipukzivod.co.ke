'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Event, Announcement } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import AnnouncementsPage from './announcements/page';

const partnerLogos = PlaceHolderImages.filter((img) => img.id.startsWith('partner'));

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const firestore = useFirestore();

  const eventsSlider = [
    {
      id: 1,
      image: '/images/w1eb.jpg',
      caption: 'Celebrating world cooperative day with our members',
    },
    {
      id: 2,
      image: '/images/web,11.jpg',
      caption: 'Chipukizi Annual Innovation Summit',
    },
    {
      id: 3,
      image: '/images/web.4.jpg',
      caption: 'Community Outreach Program',
    },
  ];

  // 🔹 Fetch events manually — safer and permission-aware
  useEffect(() => {
    async function fetchEvents() {
      if (!firestore) return;
      try {
        const q = query(
          collection(firestore, 'events'),
          where('status', '==', 'published'),
          orderBy('startDatetime', 'asc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Event[];
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, [firestore]);

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % eventsSlider.length);
      }, 5000);
    }
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isHovered, eventsSlider.length]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="hero py-16"
          style={{
            backgroundImage: "url('/images/web.4.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="hero-content max-w-4xl mx-auto text-center space-y-6 text-white-500">
            <div className="bg-black/50 p-6 rounded-lg inline-block">
              <h1 className="text-4xl font-bold mb-4">
                Chipukizi VOD Co-operative Society
              </h1>
              <div className="hero-description mb-6">
                <p>
                  Chipukizi VOD (Voice of Drama) Co-operative Society Limited is
                  a youth-owned and run worker co-operative society registered
                  under the Kenyan Co-operative Act. We promote brands and
                  provide professional, customized entertainment that educates,
                  informs, and inspires.
                </p>
              </div>
            </div>
            {/* CTA Buttons */}
            <div className="cta-buttons flex flex-wrap gap-4 justify-center">
              <Link href="/join" className="cta-btn primary bg-purple-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-purple-700">
                Join Us
              </Link>
              <Link href="#partner" className="cta-btn secondary bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">
                Partner With Us
              </Link>
              <Link href="/services" className="cta-btn tertiary bg-gray-100 text-purple-700 px-6 py-2 rounded font-bold shadow hover:bg-purple-200">
                View Services
              </Link>
              <Link href="/booknow" className="cta-btn primary bg-purple-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-purple-700">
                Book Now
              </Link>
              <Link href="/contact" className="cta-btn secondary bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Welcome and Events */}
        <section className="welcome-events-section py-16 bg-white max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Welcome */}
            <div className="welcome-box bg-gray-100 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Welcome Message
              </h2>
              <div className="text-gray-700 text-sm leading-relaxed">
                <img
                  src="/images/chairperson.jpg"
                  alt="Chairperson"
                  className="rounded-md w-40 h-48 object-cover float-left mr-4 mb-2"
                />
                <p>
                  I am delighted to extend a warm welcome to you on behalf of
                  Chipukizi VOD Cooperative Society, a premier platform
                  dedicated to empowering upcoming talented individuals.
                </p>
                <p>
                  We specialize in marketing products through engaging video
                  clips and strategic social media campaigns.
                </p>
                <p>
                  <strong>John Njuguna Maina</strong>
                </p>
                <p className="text-sm">Chairperson</p>
              </div>
            </div>

            {/* Events Slider */}
            <div
              className="events-box relative rounded-lg overflow-hidden shadow-md"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                News and Events
              </h2>
              <div className="relative w-full h-80">
                <img
                  src={eventsSlider[currentIndex].image}
                  alt={eventsSlider[currentIndex].caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-4 py-2 rounded shadow-md">
                  <p className="text-sm font-semibold text-gray-800">
                    {eventsSlider[currentIndex].caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="py-16 lg:py-24 bg-card">
          <AnnouncementsPage />
        </section>

        {/* Events */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center tracking-tight">
              Upcoming Events
            </h2>
            {loadingEvents ? (
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    {event.imageUrl && (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDatetime).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      <Button asChild variant="link" className="px-0 mt-2">
                        <Link href={`/events/${event.id}`}>
                          Read More <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground mt-12">
                No upcoming events right now. Check back soon!
              </p>
            )}
          </div>
        </section>

        {/* Partners */}
        <section className="py-16" id="partner">
          <div className="container text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Trusted by visionary partners
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {partnerLogos.map((logo) => (
                <Image
                  key={logo.id}
                  src={logo.imageUrl}
                  alt={logo.description}
                  width={150}
                  height={50}
                  className="object-contain"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
