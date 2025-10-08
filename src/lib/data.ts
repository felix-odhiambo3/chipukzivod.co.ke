export type Event = {
    id: string;
    title: string;
    description: string;
    startDatetime: string;
    endDatetime: string;
    timezone: string;
    eventType: string;
    location?: string;
    imageUrl?: string;
    organizer: string;
    status: 'published' | 'draft';
    createdByAdminId: string;
    createdAt: string;
    updatedAt: string;
};

export const services = [
    {
      title: "Video Production",
      description: "High-quality video production services for corporate clients, events, and marketing campaigns.",
      imageUrl: "https://picsum.photos/seed/service1/400/300",
      imageHint: "video production"
    },
    {
      title: "Professional Photography",
      description: "Capture your most important moments with our professional photography services.",
      imageUrl: "https://picsum.photos/seed/service2/400/300",
      imageHint: "photography session"
    },
    {
      title: "Live Streaming",
      description: "Broadcast your events to a wider audience with our reliable live streaming solutions.",
      imageUrl: "https://picsum.photos/seed/service3/400/300",
      imageHint: "live streaming"
    }
];
