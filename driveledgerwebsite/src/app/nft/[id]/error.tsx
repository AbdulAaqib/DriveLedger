'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('NFT page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 gradient-text">Something went wrong</h1>
      <p className="text-lg text-black dark:text-muted-foreground mb-8">
        {error.message || 'Failed to load NFT data. Please try again.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vehicle">
            Return to Vehicle Search
          </Link>
        </Button>
      </div>
    </div>
  );
} 