import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CarData } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');
    const limit = searchParams.get('limit');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('search');

    let query = supabase.from('car_data').select('*');

    // Filter by unique_id if provided
    if (uniqueId) {
      query = query.eq('unique_id', uniqueId);
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query = query
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);
    }

    // Search in fault and unique_id if search term provided
    if (searchTerm) {
      query = query.or(`fault.ilike.%${searchTerm}%,unique_id.ilike.%${searchTerm}%`);
    }

    // Always order by timestamp descending
    query = query.order('timestamp', { ascending: false });

    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
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