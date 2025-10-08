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

export type Service = {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
};

export type Booking = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    serviceId: string;
    serviceTitle: string;
    message: string;
    status: 'pending' | 'contacted';
    createdAt: string;
};
