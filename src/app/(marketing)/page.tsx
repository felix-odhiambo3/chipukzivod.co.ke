
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Event } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const partnerLogos = PlaceHolderImages.filter(img => img.id.startsWith('partner'));

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'events'), 
      where('status', '==', "published"),
      orderBy('startDatetime', 'asc'),
      limit(3)
    );
  }, [firestore]);

  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

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

  useEffect(() => {
    if (!isHovered) {
      const handle = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % eventsSlider.length);
      }, 5000);
      intervalRef.current = handle;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, eventsSlider.length]);


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="hero py-16"
          style={{ backgroundImage: "url('/images/web.4.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="hero-content max-w-4xl mx-auto text-center space-y-6 text-white-500">
            <div className="bg-black/50 p-6 rounded-lg inline-block">
              <h1 className="text-4xl font-bold mb-4">Chipukizi VOD Co-operative Society</h1>
              <div className="hero-description mb-6">
                <p>
                  Chipukizi VOD (Voice of Drama) Co-operative Society Limited is a youth-owned and run worker co-operative society registered under the Kenyan Co-operative Act. We promote brands and provide professional, customized entertainment that educates, informs, and inspires. We identify and train talented unemployed youth, polish their skills, and deliver meaningful content together as a team.
                </p>
              </div>
            </div>
            {/* Call-to-Action Buttons */}
            <div className="cta-buttons flex flex-wrap gap-4 justify-center">
              <Link href="/join" className="cta-btn primary bg-purple-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-purple-700">Join Us</Link>
              <Link href="#partner" className="cta-btn secondary bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">Partner With Us</Link>
              <Link href="/services" className="cta-btn tertiary bg-gray-100 text-purple-700 px-6 py-2 rounded font-bold shadow hover:bg-purple-200">View Services</Link>
              <Link href="/booknow" className="cta-btn primary bg-purple-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-purple-700">Book Now</Link>
              <Link href="/contact" className="cta-btn secondary bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">Contact Us</Link>
            </div>
          </div>
        </section>

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
                  I am delighted to extend a warm welcome to you on behalf of Chipukizi VOD Cooperative Society, a premier platform dedicated to empowering upcoming talented individuals and fostering creative excellence in the digital marketing landscape.
                </p>
                <p>
                  At Chipukizi VOD, we recognize the importance of nurturing creativity and innovation in today's competitive digital world. Our state-of-the-art video production facilities, cutting-edge marketing strategies, and industry-relevant services ensure that our clients and partners receive comprehensive support that aligns with the demands of the modern marketplace.
                </p>
                <p>
                  We specialize in marketing products through engaging video clips and strategic social media campaigns, helping businesses reach their target audiences effectively while providing opportunities for talented individuals to showcase their skills.
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
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">News and Events</h2>
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
                <button
                  onClick={() => setCurrentIndex((currentIndex - 1 + eventsSlider.length) % eventsSlider.length)}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800/50 text-white p-2 rounded-full hover:bg-gray-800"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => setCurrentIndex((currentIndex + 1) % eventsSlider.length)}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800/50 text-white p-2 rounded-full hover:bg-gray-800"
                >
                  <ChevronRight />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {eventsSlider.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-3 h-3 rounded-full ${
                        currentIndex === idx ? 'bg-gray-800' : 'bg-gray-400 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Updates Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold font-headline text-center tracking-tight">Latest Updates & Events</h2>
            <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">Stay up to date with our latest news, workshops, and community highlights.</p>
            
            {isLoading && (
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full"/>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && (
              <div className="mt-12">
                {events && events.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                      <Card key={event.id} className="overflow-hidden">
                        {event.imageUrl && <Image src={event.imageUrl} alt={event.title} width={400} height={300} className="w-full h-48 object-cover" data-ai-hint="event photo"/>}
                        <CardHeader>
                          <CardTitle>{event.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{new Date(event.startDatetime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                          <Button asChild variant="link" className="px-0 mt-2">
                              <Link href={`/events/${event.id}`}>Read More <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
            )}
            
          </div>
        </section>

        {/* Social Media & Video Section */}
        <section className="py-16 lg:py-24 bg-card">
            <div className="container text-center">
                 <h2 className="text-3xl font-bold font-headline tracking-tight">See Our Work in Action</h2>
                 <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Watch our latest showcase and connect with us on social media.</p>
                <div className="mt-8 aspect-video max-w-4xl mx-auto">
                    <iframe
                        className="w-full h-full rounded-lg shadow-xl"
                        src="https://www.youtube.com/embed/6UN8Tg-71Hg"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>

        {/* Partner Logos */}
        <section className="py-16" id="partner">
          <div className="container">
            <h2 className="text-center text-xl font-semibold text-muted-foreground">Trusted by visionary partners</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {partnerLogos.map((logo) => (
                <Image
                  key={logo.id}
                  src={logo.imageUrl}
                  alt={logo.description}
                  width={150}
                  height={50}
                  className="object-contain"
                  data-ai-hint={logo.imageHint}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
