import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First, try to find the NFT in car_data
    const { data: nftData, error: nftError } = await supabase
      .from('car_data')
      .select('*')
      .eq('unique_id', params.id)
      .single();

    if (nftError) {
      console.error('Error fetching NFT data:', nftError);
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
    }

    // If we have IPFS data, try to fetch it
    let ipfsData = null;
    if (nftData.ipfs_link) {
      try {
        const ipfsResponse = await fetch(nftData.ipfs_link);
        if (ipfsResponse.ok) {
          ipfsData = await ipfsResponse.json();
        }
      } catch (error) {
        console.error('Error fetching IPFS data:', error);
      }
    }

    // Return combined data
    return NextResponse.json({
      nftData,
      ipfsData
    });
  } catch (error) {
    console.error('Error in NFT API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 