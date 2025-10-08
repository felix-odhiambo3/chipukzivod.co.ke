'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { events } from '@/lib/data';
import { ArrowRight, Film, Handshake, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
const partnerLogos = PlaceHolderImages.filter(img => img.id.startsWith('partner'));

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src="./images/second.svg"
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 container">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline leading-tight tracking-tight">
              Chipukizi Voice Of Drama Cooperative Society
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
            Chipukizi VOD (Voice of Drama) Co-operative Society Limited is a youth-owned and run worker co-operative society registered under the Kenyan Co-operative Act. We promote brands and provide professional, customized entertainment that educates, informs, and inspires. We identify and train talented unemployed youth, polish their skills, and deliver meaningful content together as a team.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/services">View Services</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact">Contact Us</Link>
              </Button>
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


        {/* Brief Overview Section */}
        <section className="py-16 lg:py-24 bg-card">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-headline tracking-tight">Welcome to Chipukizi Hub</h2>
              <p className="mt-4 text-muted-foreground">
                We are a vibrant community of film and video professionals, united by a passion for storytelling and a commitment to cooperative principles. Our mission is to create high-quality content while fostering a supportive and equitable environment for our members.
              </p>
              <div className="mt-6 flex gap-4">
                <Button asChild>
                  <Link href="/about">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/join">Join Us</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-background rounded-lg text-center">
                    <Film className="mx-auto h-10 w-10 text-primary mb-2"/>
                    <h3 className="font-semibold">Creative Production</h3>
                    <p className="text-sm text-muted-foreground">From concept to final cut.</p>
                </div>
                <div className="p-6 bg-background rounded-lg text-center">
                    <Handshake className="mx-auto h-10 w-10 text-primary mb-2"/>
                    <h3 className="font-semibold">Partnerships</h3>
                    <p className="text-sm text-muted-foreground">Collaborating for impact.</p>
                </div>
                <div className="p-6 bg-background rounded-lg text-center">
                    <Heart className="mx-auto h-10 w-10 text-primary mb-2"/>
                    <h3 className="font-semibold">Community Focused</h3>
                    <p className="text-sm text-muted-foreground">Giving back is in our DNA.</p>
                </div>
                 <div className="p-6 bg-background rounded-lg text-center">
                    <ArrowRight className="mx-auto h-10 w-10 text-primary mb-2"/>
                    <h3 className="font-semibold">Member Growth</h3>
                    <p className="text-sm text-muted-foreground">Investing in our people.</p>
                </div>
            </div>
          </div>
        </section>

        {/* Latest Updates Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold font-headline text-center tracking-tight">Latest Updates & Events</h2>
            <p className="mt-2 text-muted-foreground text-center max-w-xl mx-auto">Stay up to date with our latest news, workshops, and community highlights.</p>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 3).map((event) => (
                <Card key={event.title} className="overflow-hidden">
                  {event.image && <Image src={event.image.imageUrl} alt={event.title} width={400} height={300} className="w-full h-48 object-cover" data-ai-hint={event.image.imageHint}/>}
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <Button asChild variant="link" className="px-0 mt-2">
                        <Link href="/events">Read More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
        <section className="py-16">
          <div className="container">
            <h2 className="text-center text-xl font-semibold text-muted-foreground">Trusted by visionary partners</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {partnerLogos.map((logo) => (
                <Image
                  key={logo.id}
                  src="./images/second.svg"
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