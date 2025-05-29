import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if the request is for the NFT page with a VIN
  if (request.nextUrl.pathname.startsWith('/nft/')) {
    const id = request.nextUrl.pathname.split('/')[2];
    
    // If the ID looks like a VIN (longer than 10 characters), try to redirect to the NFT ID
    if (id && id.length > 10) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/vin-to-nft/${id}`);
        const data = await response.json();
        
        if (data.nftId) {
          return NextResponse.redirect(new URL(`/nft/${data.nftId}`, request.url));
        }
      } catch (error) {
        console.error('Error in middleware:', error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/nft/:path*',
} 