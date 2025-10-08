'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import type { Service } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

function ServiceCard({ service }: { service: Service & { id: string } }) {
  return (
    <Card key={service.id} className="overflow-hidden flex flex-col">
      {service.imageUrl && (
        <div className="relative h-56 w-full">
          <Image src={service.imageUrl} alt={service.title} fill style={{objectFit: 'cover'}} data-ai-hint="service photo"/>
        </div>
      )}
      <div className="flex flex-col flex-grow">
        <CardHeader>
          <CardTitle>{service.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </CardContent>
        <CardContent>
          <Button asChild>
            <Link href={`/booknow?serviceId=${service.id}&serviceTitle=${encodeURIComponent(service.title)}`}>
              Book Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

function ServicesLoadingSkeleton() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden flex flex-col">
                    <Skeleton className="h-56 w-full" />
                    <div className="flex flex-col flex-grow">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardContent>
                            <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </div>
                </Card>
            ))}
        </div>
    );
}

export default function ServicesPage() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'services'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Our Services</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Professional creative services to bring your vision to life.
        </p>
      </div>

      {isLoading ? (
        <ServicesLoadingSkeleton />
      ) : services && services.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">No Services Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">Please check back later for our service offerings.</p>
        </div>
      )}
    </div>
  );
}
