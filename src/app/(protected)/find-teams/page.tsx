'use client';

import { useState, useEffect, FormEvent } from 'react';
import { waitlistApi } from '@/lib/api/waitlist';
import { teamApi } from '@/lib/api/team';
import { WaitlistListing } from '@/types/waitlist';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FindTeamsPage() {
  const [listings, setListings] = useState<WaitlistListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');

  const fetchListings = async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await waitlistApi.getGlobalWaitlists(search);
      setListings(data);
    } catch (err) {
      console.error('Error fetching global waitlists:', err);
      toast.error('Failed to load teams looking for members.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchListings(query);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Find Teams</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="Search teams..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>
      {isLoading ? (
        <p>Loading...</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map(listing => (
            <Card key={listing.id}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{listing.team.name}</h3>
                  <Link href={`/teams/${listing.team.slug}`} className="text-sm text-muted-foreground hover:text-primary">
                    View Team
                  </Link>
                </div>
                <Button onClick={async () => {
                  try {
                    await teamApi.requestToJoin(listing.team.id);
                    toast.success('Requested to join team');
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to request to join');
                  }
                }}>
                  Join
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No teams are currently looking for members.</p>
      )}
    </div>
  );
} 