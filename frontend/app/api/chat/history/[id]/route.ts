import { NextResponse } from 'next/server';
import { getChatMessages } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const history = await getChatMessages(conversationId);
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
