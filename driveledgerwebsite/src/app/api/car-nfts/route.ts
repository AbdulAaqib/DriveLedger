import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CarNFT } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    let query = supabase.from('car_nfts').select('*');

    if (vin) {
      query = query.eq('vin', vin);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 