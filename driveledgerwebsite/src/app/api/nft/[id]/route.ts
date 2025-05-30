import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// IPFS Gateway URLs in order of preference
const IPFS_GATEWAYS = [
  'https://coffee-electoral-shrimp-180.mypinata.cloud',
  'https://gateway.pinata.cloud',
  'https://ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://gateway.ipfs.io',
  'https://nftstorage.link'
];

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function sanitizeIpfsHash(ipfsHash: string): string {
  // Remove any gateway URLs if present
  const cleanHash = ipfsHash.replace(/^https?:\/\/[^/]+\/ipfs\//, '');
  
  // Remove ipfs:// protocol if present
  return cleanHash.replace(/^ipfs:\/\//, '');
}

async function fetchIPFSContent(ipfsHash: string): Promise<Response | null> {
  const cleanHash = sanitizeIpfsHash(ipfsHash);
  
  // Try each gateway in sequence until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}/ipfs/${cleanHash}`;
      console.log(`Trying IPFS gateway: ${url}`);
      
      const response = await fetchWithTimeout(url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return response;
      }
      
      // If we get rate limited, try the next gateway
      if (response.status === 429) {
        console.log(`Rate limited by ${gateway}, trying next gateway...`);
        continue;
      }

      // For other errors, also try the next gateway
      console.error(`Failed to fetch from ${gateway} with status ${response.status}`);
    } catch (error) {
      console.error(`Error fetching from ${gateway}:`, error);
      // Continue to next gateway on error
      continue;
    }
  }
  
  // If all gateways fail, return null
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json(
      { error: 'Missing NFT ID' },
      { status: 400 }
    );
  }

  try {
    // First, try to find the NFT in car_data
    const { data: nftData, error: nftError } = await supabase
      .from('car_data')
      .select('*')
      .eq('unique_id', params.id)
      .single();

    if (nftError) {
      console.error('Error fetching NFT data:', nftError);
      return NextResponse.json(
        { error: 'NFT not found', details: nftError.message },
        { status: 404 }
      );
    }

    if (!nftData) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      );
    }

    // If we have IPFS data, try to fetch it
    let ipfsData = null;
    let ipfsError = null;
    
    if (nftData.ipfs_link) {
      try {
        const ipfsResponse = await fetchIPFSContent(nftData.ipfs_link);
        
        if (ipfsResponse) {
          ipfsData = await ipfsResponse.json();
        } else {
          ipfsError = 'Failed to fetch from all IPFS gateways';
          console.error(ipfsError);
        }
      } catch (error) {
        ipfsError = error instanceof Error ? error.message : 'Unknown error fetching IPFS data';
        console.error('Error fetching IPFS data:', error);
      }
    }

    // Return combined data with strong caching headers
    return NextResponse.json({
      nftData,
      ipfsData,
      ipfsError: ipfsError // Include any IPFS errors in the response
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error in NFT API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 