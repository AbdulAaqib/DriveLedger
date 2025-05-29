import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4 gradient-text">NFT Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        The NFT you&apos;re looking for could not be found in our records.
      </p>
      <Button asChild>
        <Link href="/vehicle">
          Return to Vehicle Search
        </Link>
      </Button>
    </div>
  );
} 