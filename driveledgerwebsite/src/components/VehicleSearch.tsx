'use client';

import { useState } from 'react';
import { CarNFT } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export function VehicleSearch() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState<CarNFT | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!vin) {
      setError('Please enter a VIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search in car_nfts table
      const nftResponse = await fetch(`/api/car-nfts?vin=${vin}`);
      const nftResult = await nftResponse.json();

      if (!nftResponse.ok) {
        throw new Error(nftResult.error || 'Failed to fetch NFT data');
      }

      if (nftResult && nftResult.length > 0) {
        setNftData(nftResult[0]);
      } else {
        setNftData(null);
        setError('No NFTs found for this VIN');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setNftData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          type="text"
          placeholder="Enter VIN"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline" disabled={loading} type="submit">
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      {nftData && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle NFTs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{nftData.vin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">NFT Tokens</p>
                <div className="flex flex-wrap gap-2">
                  {nftData.nfts.split(',').map((nft) => (
                    <Link
                      key={nft}
                      href={`/nft/${nft.trim()}`}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors"
                    >
                      #{nft.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 