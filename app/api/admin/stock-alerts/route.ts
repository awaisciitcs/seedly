import { NextResponse } from 'next/server';
import {
  getAllStockSubscriptions,
  triggerManualRestockAlert,
  deleteStockSubscription,
} from '@/lib/services/stockAlerts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const subscriptions = getAllStockSubscriptions({ status, search });
    return NextResponse.json({ data: subscriptions });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, subscriptionId } = body;

    if (action === 'trigger_alert' && subscriptionId) {
      const ok = triggerManualRestockAlert(subscriptionId);
      return NextResponse.json({
        success: ok,
        message: ok ? 'Restock alert sent successfully!' : 'Failed to send alert',
      });
    }

    return NextResponse.json({ error: { message: 'Invalid action' } }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: { message: 'ID is required' } }, { status: 400 });
    }

    const ok = deleteStockSubscription(id);
    return NextResponse.json({
      success: ok,
      message: ok ? 'Subscription deleted successfully' : 'Not found',
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
