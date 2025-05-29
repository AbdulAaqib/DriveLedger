import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
    if (nftData.ipfs_link) {
      try {
        const ipfsResponse = await fetch(nftData.ipfs_link);
        if (ipfsResponse.ok) {
          ipfsData = await ipfsResponse.json();
        } else {
          console.error('IPFS fetch failed:', await ipfsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching IPFS data:', error);
      }
    }

    // Return combined data
    return NextResponse.json({
      nftData,
      ipfsData
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
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