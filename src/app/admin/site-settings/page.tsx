'use client';

import { ThemeSettings } from './theme-settings';

export default function SiteSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your site's appearance and other global settings.
        </p>
      </div>
      <ThemeSettings />
    </div>
  );
}
