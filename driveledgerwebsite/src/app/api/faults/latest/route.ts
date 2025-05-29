import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET() {
  try {
    // Get all fault data with NFT information
    const { data: faultData } = await supabase
      .from('car_data')
      .select('unique_id, fault, confidence, timestamp')
      .not('fault', 'is', null)
      .order('timestamp', { ascending: false })
      .limit(20);

    return NextResponse.json(faultData || []);
  } catch (error) {
    console.error('Error fetching fault data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fault data' },
      { status: 500 }
    );
  }
} 