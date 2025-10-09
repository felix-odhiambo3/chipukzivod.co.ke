
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
import { Bell, Cog, HelpingHand, Home, LayoutDashboard, Palette, PenSquare, Users, Megaphone, Calendar, Lightbulb, User, LogOut, ChevronDown, Briefcase, ShoppingCart, MessageSquare, Mail, ShieldAlert } from "lucide-react";
import Link from 'next/link';
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const memberNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", tooltip: "Dashboard" },
  { href: "/events", icon: Calendar, label: "Events", tooltip: "Events" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements", badge: "3", tooltip: "Announcements" },
  { href: "/dashboard/resources", icon: HelpingHand, label: "Resources", tooltip: "Resources" },
  { href: "/dashboard/suggestion-box", icon: Lightbulb, label: "Suggestion Box", tooltip: "Suggestion Box" },
];

const adminNavItems = [
    { href: "/admin/events", icon: Briefcase, label: "Manage Events", tooltip: "Manage Events" },
    { href: "/admin/services", icon: ShoppingCart, label: "Manage Services", tooltip: "Manage Services" },
    { href: "/admin/bookings", icon: MessageSquare, label: "Manage Bookings", tooltip: "Manage Bookings" },
    { href: "/admin/contacts", icon: Mail, label: "Contact Inquiries", tooltip: "Contact Inquiries" },
    { href: "/admin/suggestions", icon: Lightbulb, label: "Suggestions", tooltip: "Member Suggestions" },
    { href: "/admin/resources", icon: HelpingHand, label: "Manage Resources", tooltip: "Manage Resources" },
    { href: "/admin/content-suggestions", icon: PenSquare, label: "Content AI", tooltip: "Content AI" },
    { href: "/admin/users", icon: Users, label: "Manage Users", tooltip: "Manage Users" },
    { href: "/admin/site-settings", icon: Palette, label: "Site Settings", tooltip: "Site Settings" },
];

function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  const isActive = (href: string) => pathname.startsWith(href);
  const [memberToolsOpen, setMemberToolsOpen] = React.useState(true);
  
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

  const displayName = user?.displayName || 'Member';
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
             <Link href="/dashboard">
                <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <Collapsible open={memberToolsOpen} onOpenChange={setMemberToolsOpen} className="w-full">
            <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start mt-4" >
                    Member Tools
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", memberToolsOpen && "rotate-180")} />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenu className="mt-2">
                  {memberNavItems.slice(1).map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <Link href={item.href}>
                        <SidebarMenuButton isActive={isActive(item.href)} tooltip={item.tooltip}>
                          <item.icon />
                          <span>{item.label}</span>
                          {item.badge && <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
            </CollapsibleContent>
        </Collapsible>
        
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
          <Link href="/login" className="group-data-[collapsible=icon]:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4"/>
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeaderContent() {
    const { isMobile } = useSidebar();
    const pathname = usePathname();
    const pageTitle = React.useMemo(() => {
        const allItems = [...memberNavItems, ...adminNavItems, {href: "/admin/events/new", label: "New Event"}, {href: "/admin/services/new", label: "New Service"}, {href: "/admin/users/new", label: "New User"}, {href: "/admin/resources/new", label: "New Resource"}];
        if (pathname.match(/\/admin\/events\/edit\/.+/)) return "Edit Event";
        if (pathname.match(/\/admin\/services\/edit\/.+/)) return "Edit Service";
        if (pathname.match(/\/admin\/resources\/edit\/.+/)) return "Edit Resource";

        const currentItem = allItems.find(item => pathname.startsWith(item.href) && item.href !== "/");
        if (pathname.startsWith('/events/')) return "Event Details";
        return currentItem?.label || "Dashboard";
    }, [pathname]);

    return (
         <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
            <SidebarTrigger className={isMobile ? 'flex' : 'hidden'} />
            <div className="flex-1">
              <h1 className="text-lg font-semibold font-headline">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
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

  useEffect(() => {
    if (!isUserLoading && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        {isUserLoading ? (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-96 w-screen max-w-4xl" />
            </div>
        ) : (
          <div className="text-center">
            <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold font-headline">Access Denied</h1>
            <p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    );
  }

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
