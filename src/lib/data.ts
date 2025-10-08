import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const events = [
  {
    id: "annual-general-meeting",
    title: 'Annual General Meeting',
    date: '2024-08-15T10:00:00Z',
    description: 'Join us for our annual general meeting to discuss the future of our cooperative.',
    image: findImage('event1'),
    type: 'upcoming'
  },
  {
    id: "digital-storytelling-workshop",
    title: 'Digital Storytelling Workshop',
    date: '2024-09-05T14:00:00Z',
    description: 'Learn the art of digital storytelling from industry experts. Limited slots available.',
    image: findImage('event2'),
    type: 'upcoming'
  },
  {
    id: "chipukizi-film-festival",
    title: 'Chipukizi Film Festival',
    date: '2024-07-20T18:00:00Z',
    description: 'A showcase of the best films produced by our members over the past year.',
    image: findImage('event3'),
    type: 'past'
  }
];

export const services = [
    {
      title: "Video Production",
      description: "High-quality video production services for corporate clients, events, and marketing campaigns.",
      image: findImage('service1'),
    },
    {
      title: "Professional Photography",
      description: "Capture your most important moments with our professional photography services.",
      image: findImage('service2'),
    },
    {
      title: "Live Streaming",
      description: "Broadcast your events to a wider audience with our reliable live streaming solutions.",
      image: findImage('service3'),
    }
];
