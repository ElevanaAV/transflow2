// src/app/projects/[id]/not-found.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProjectNotFound() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    // If we have an ID parameter, reload the page to try again
    if (id) {
      // This is a hack, but it forces the browser to retry fetching the page
      window.location.href = `/projects/${id}`;
    } else {
      router.push('/projects/overview');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg">Loading project data...</p>
      </div>
    </div>
  );
}