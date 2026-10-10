import { readAdminJson, AdminInputError, adminId, adminText, adminEnum } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import {
  getAllStockSubscriptions,
  triggerManualRestockAlert,
  deleteStockSubscription,
} from '@/lib/services/stockAlerts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    if(status) adminEnum(status,['ACTIVE','NOTIFIED','UNSUBSCRIBED','ALL'],'subscription status');
    const subscriptions = await getAllStockSubscriptions({ status, search });
    return NextResponse.json({ data: subscriptions });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await readAdminJson(request);
    const { action, subscriptionId } = body;

    if (action === 'trigger_alert' && subscriptionId) {
      adminId(subscriptionId, 'subscription ID');
      const ok = await triggerManualRestockAlert(subscriptionId);
      return NextResponse.json({
        success: ok,
        message: ok ? 'Restock alert sent successfully!' : 'Failed to send alert',
      }, { status: ok ? 200 : 503 });
    }

    return NextResponse.json({ error: { message: 'Invalid action' } }, { status: 400 });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    adminId(id, 'subscription ID');

    if (!id) {
      return NextResponse.json({ error: { message: 'ID is required' } }, { status: 400 });
    }

    const ok = await deleteStockSubscription(id);
    return NextResponse.json({
      success: ok,
      message: ok ? 'Subscription deleted successfully' : 'Not found',
    }, { status: ok ? 200 : 404 });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: 'This operation is temporarily unavailable. Please try again.' } }, { status: 503 });
  }
}
