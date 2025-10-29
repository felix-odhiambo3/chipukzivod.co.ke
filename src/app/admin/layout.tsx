
'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Cog, HelpingHand, Home, LayoutDashboard, Palette, PenSquare, Users, Megaphone, Calendar, Lightbulb, User, LogOut, ChevronDown, Briefcase, ShoppingCart, MessageSquare, Mail, ShieldAlert, Image as ImageIcon } from "lucide-react";
import Link from 'next/link';
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useAuth, useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { collection, query, orderBy, doc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import type { Notification } from '@/lib/data';

const memberNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/dashboard/events", icon: Calendar, label: "Events", tooltip: "Events" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements", badge: "3", tooltip: "Announcements" },
  { href: "/dashboard/resources", icon: HelpingHand, label: "Resources", tooltip: "Resources" },
  { href: "/dashboard/suggestion-box", icon: Lightbulb, label: "Suggestion Box", tooltip: "Suggestion Box" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "Live Chat", tooltip: "Live Chat" },
];

const adminNavItems = [
    { href: "/admin/events", icon: Briefcase, label: "Manage Events", tooltip: "Manage Events" },
    { href: "/admin/gallery", icon: ImageIcon, label: "Manage Gallery", tooltip: "Manage Gallery" },
    { href: "/admin/announcements", icon: Megaphone, label: "Manage Announcements", tooltip: "Manage Announcements" },
    { href: "/admin/notifications", icon: Bell, label: "Manage Notifications", tooltip: "Manage Notifications" },
    { href: "/admin/services", icon: ShoppingCart, label: "Manage Services", tooltip: "Manage Services" },
    { href: "/admin/bookings", icon: MessageSquare, label: "Manage Bookings", tooltip: "Manage Bookings" },
    { href: "/admin/contacts", icon: Mail, label: "Contact Inquiries", tooltip: "Contact Inquiries" },
    { href: "/admin/suggestions", icon: Lightbulb, label: "Suggestions", tooltip: "Member Suggestions" },
    { href: "/admin/resources", icon: HelpingHand, label: "Manage Resources", tooltip: "Manage Resources" },
    { href: "/admin/content-suggestions", icon: PenSquare, label: "Content AI", tooltip: "Content AI" },
    { href: "/admin/users", icon: Users, label: "Manage Users", tooltip: "Manage Users" },
];

function AppSidebar() {
  const pathname = usePathname();
  const { user: realUser, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  const isActive = (href: string) => pathname.startsWith(href);
  const [memberToolsOpen, setMemberToolsOpen] = React.useState(true);
  
  // Fake user for temporary access
  const tempAdminUser = {
      uid: 'temp-admin-user',
      displayName: "Temp Admin",
      email: "admin@chipukizivod.co.ke",
      photoURL: "",
      role: "admin"
  } as any;
  
  const user = realUser || tempAdminUser;
  
  if (isUserLoading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4 p-2">
            <div className="space-y-2">
              <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
            </div>
             <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
             <div className="space-y-2">
              <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 rounded-md m-2">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    )
  }

  const displayName = user?.displayName || 'Admin';
  const displayEmail = user?.email || '';
  const displayAvatar = user?.photoURL || '';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <div className="flex-grow" />
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/admin">
                <SidebarMenuButton isActive={pathname === '/admin'} tooltip="Admin Dashboard">
                  <LayoutDashboard />
                  <span>Admin Dashboard</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Link href="/dashboard">
                <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Member Dashboard">
                  <LayoutDashboard />
                  <span>Member Dashboard</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {user?.role === "admin" && (
            <>
            <SidebarMenu className="mt-4">
                <li className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden">Admin Panel</li>
                {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                      <SidebarMenuButton isActive={isActive(item.href)} tooltip={item.tooltip}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent m-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 group-data-[collapsible=icon]:hidden" onClick={handleLogout}>
              <LogOut className="h-4 w-4"/>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeaderContent() {
    const { isMobile } = useSidebar();
    const pathname = usePathname();
    const { user: realUser } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [popoverOpen, setPopoverOpen] = useState(false);
    
    const tempAdminUser = {
      uid: 'temp-admin-user',
      displayName: "Temp Admin",
      email: "admin@chipukizivod.co.ke",
      photoURL: "",
      role: "admin"
    } as any;
    const user = realUser || tempAdminUser;

    const notificationsQuery = useMemoFirebase(() =>
        (firestore && user)
            ? query(collection(firestore, 'notifications'), orderBy('createdAt', 'desc'))
            : null
    , [firestore, user]);

    const { data: notifications } = useCollection<Notification>(notificationsQuery);

    const unreadNotifications = React.useMemo(() => {
        if (!notifications || !user) return [];
        return notifications.filter(n => !n.readBy.includes(user.uid));
    }, [notifications, user]);

    const handleMarkAsRead = async (notificationId: string) => {
        if (!firestore || !user) return;
        const notifRef = doc(firestore, 'notifications', notificationId);
        await updateDoc(notifRef, {
            readBy: arrayUnion(user.uid)
        });
    };

    const handleMarkAllAsRead = async () => {
        if (!firestore || !user || unreadNotifications.length === 0) return;
        const batch = writeBatch(firestore);
        unreadNotifications.forEach(notif => {
            const notifRef = doc(firestore, 'notifications', notif.id);
            batch.update(notifRef, { readBy: arrayUnion(user.uid) });
        });
        await batch.commit();
    };

    const pageTitle = React.useMemo(() => {
        const allItems = [...memberNavItems, ...adminNavItems, {href: "/admin", label: "Admin Dashboard"}, {href: "/admin/events/new", label: "New Event"}, {href: "/admin/services/new", label: "New Service"}, {href: "/admin/users/new", label: "New User"}, {href: "/admin/resources/new", label: "New Resource"}, {href: "/admin/announcements/new", label: "New Announcement"}, {href: "/admin/notifications/new", label: "New Notification"}];
        if (pathname.match(/\/admin\/events\/edit\/.+/)) return "Edit Event";
        if (pathname.match(/\/admin\/services\/edit\/.+/)) return "Edit Service";
        if (pathname.match(/\/admin\/resources\/edit\/.+/)) return "Edit Resource";
        if (pathname.match(/\/admin\/announcements\/edit\/.+/)) return "Edit Announcement";
        if (pathname.match(/\/admin\/notifications\/edit\/.+/)) return "Edit Notification";
        if (pathname.match(/\/events\/.+/)) return "Event Details";


        const currentItem = allItems.find(item => pathname === item.href);
        return currentItem?.label || "Admin";
    }, [pathname]);

    return (
         <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
            <SidebarTrigger className={isMobile ? 'flex' : 'hidden'} />
            <div className="flex-1">
              <h1 className="text-lg font-semibold font-headline">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadNotifications.length > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">Notifications</h4>
                            {unreadNotifications.length > 0 && (
                                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>Mark all as read</Button>
                            )}
                        </div>
                        <div className="grid gap-1">
                           {notifications?.length ? (
                                notifications.slice(0, 5).map(notification => {
                                    const isUnread = unreadNotifications.some(un => un.id === notification.id);
                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "-m-2 flex items-start rounded-lg p-2 transition-all",
                                                notification.link ? "hover:bg-accent hover:text-accent-foreground cursor-pointer" : "cursor-default"
                                            )}
                                            onClick={() => {
                                                if (isUnread) handleMarkAsRead(notification.id);
                                                if (notification.link) router.push(notification.link);
                                                setPopoverOpen(false);
                                            }}
                                        >
                                            {isUnread && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />}
                                            <div className="ml-2 space-y-1">
                                                <p className="text-sm font-medium leading-none">{notification.title}</p>
                                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                            </div>
                                        </div>
                                    )
                                })
                           ) : (
                             <p className="text-sm text-muted-foreground text-center py-4">No notifications yet.</p>
                           )}
                        </div>
                    </PopoverContent>
                </Popover>

              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Cog className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
               <Link href="/">
                <Button variant="outline" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Public Site
                </Button>
              </Link>
            </div>
          </header>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isUserLoading && user?.role !== 'admin') {
  //     router.replace('/dashboard');
  //   }
  // }, [user, isUserLoading, router]);

  // if (isUserLoading || !user) {
  //    return (
  //     <div className="flex h-screen items-center justify-center bg-background">
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }
  
  // if (user.role !== 'admin') {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-background">
  //         <div className="text-center">
  //           <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
  //           <h1 className="mt-4 text-2xl font-bold font-headline">Access Denied</h1>
  //           <p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p>
  //           <p className="mt-1 text-sm text-muted-foreground">Redirecting to your dashboard...</p>
  //         </div>
  //     </div>
  //   );
  // }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <AppHeaderContent />
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
