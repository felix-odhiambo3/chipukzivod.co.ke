
'use client';
import { ResourceForm } from '../resource-form';

export default function NewResourcePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Create New Resource</h1>
        <p className="text-muted-foreground">
          Fill in the details below to add a new resource document.
        </p>
      </div>
      <ResourceForm />
    </div>
  );
}
