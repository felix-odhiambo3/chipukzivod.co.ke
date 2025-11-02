

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
    otherServiceDescription?: string;
    eventDate?: string;
    eventLocation?: string;
    eventDuration?: string;
};

export type ContactInquiry = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    service: string;
    message: string;
    contactMethod: string;
    preferredTime: string;
    status: 'pending' | 'responded';
    createdAt: string;
};

export type GalleryMedia = {
    id: string;
    title: string;
    caption?: string;
    type: 'image' | 'video' | 'youtube';
    url: string;
    viewCount: number;
    createdByAdminId: string;
    createdAt: any;
    updatedAt: any;
};

export type Comment = {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    text: string;
    createdAt: any;
};

export type Like = {
    id: string;
    userId: string;
    createdAt: any;
};

export type Bookmark = {
    id: string;
    mediaId: string;
    mediaTitle: string;
    mediaType: 'image' | 'video' | 'youtube';
    mediaUrl: string;
    createdAt: any;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
};

export type Suggestion = {
    id: string;
    suggestion: string;
    isAnonymous: boolean;
    userId: string;
    userName: string;
    status: 'new' | 'viewed' | 'in-progress' | 'done';
    createdAt: any;
};

export type Resource = {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    createdByAdminId: string;
    createdAt: any;
    updatedAt: any;
};

export type Announcement = {
    id: string;
    title: string;
    content: string;
    mediaUrl?: string;
    createdByAdminId: string;
    createdAt: any;
    updatedAt: any;
};

export type Notification = {
    id: string;
    title: string;
    message: string;
    link?: string;
    createdAt: any;
    readBy: string[]; // Array of user UIDs who have read the notification
};
    