import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const vin = params.vin;

    // Get NFTs for the VIN
    const { data: nftData } = await supabase
      .from('car_nfts')
      .select('nfts')
      .eq('vin', vin)
      .single();

    if (!nftData) {
      return NextResponse.json({ error: 'VIN not found' }, { status: 404 });
    }

    // Get the first NFT ID from the comma-separated list
    const nftIds = nftData.nfts.split(',').map((id: string) => id.trim());
    const firstNftId = nftIds[0];

    return NextResponse.json({ nftId: firstNftId });
  } catch (error) {
    console.error('Error fetching NFT ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT ID' },
      { status: 500 }
    );
  }
} 