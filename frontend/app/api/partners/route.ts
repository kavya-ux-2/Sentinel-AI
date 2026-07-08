import { NextResponse } from 'next/server';
import { getPartners } from '@/lib/db';

export async function GET() {
  const partners = await getPartners();
  return NextResponse.json(partners);
}
