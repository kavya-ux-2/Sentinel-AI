import { NextResponse } from 'next/server';
import { getShipments } from '@/lib/db';

export async function GET() {
  const shipments = await getShipments();
  return NextResponse.json(shipments);
}
