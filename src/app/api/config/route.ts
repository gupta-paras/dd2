import { NextResponse } from 'next/server';
import { getRestaurantConfig } from '@/lib/config';

export async function GET() {
  const config = getRestaurantConfig();
  return NextResponse.json({
    success: true,
    data: config,
  });
}
