'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TeamDetail from '@/components/teams/team-detail';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/providers/auth-provider';

export default function TeamDetailPage() {
  const { slug } = useParams();
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuth();

  // TODO: Add proper authentication check


  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <TeamDetail 
        slug={Array.isArray(slug) ? slug[0] : slug as string} 
        currentUserId={currentUser.user?.id!}
      />
    </div>
  );
} 