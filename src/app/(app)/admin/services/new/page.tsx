'use client';
import { ServiceForm } from '../service-form';

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Service</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new service.
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}
