import { NextResponse } from 'next/server';
import { unsubscribeFromStockAlert } from '@/lib/services/stockAlerts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Invalid or missing unsubscribe token', { status: 400 });
  }

  const success = unsubscribeFromStockAlert(token);

  // Return a nice HTML confirmation page
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Unsubscribed from Restock Alert | Seedly</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #FAF8F2; color: #252825; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
        .card { background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 480px; width: 100%; border: 1px solid #D9DED9; }
        h1 { color: #506A56; font-size: 24px; margin-bottom: 12px; }
        p { font-size: 14px; color: #657067; line-height: 1.6; margin-bottom: 24px; }
        a { display: inline-block; background: #506A56; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🌱 Seedly Botanical Alerts</h1>
        <p>${success ? 'You have successfully unsubscribed from this restock notification.' : 'This alert was already unsubscribed or the link has expired.'}</p>
        <a href="/">Return to Seedly Store</a>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: { message: 'Token is required' } }, { status: 400 });
    }

    const success = unsubscribeFromStockAlert(token);
    return NextResponse.json({
      success,
      message: success ? 'Unsubscribed successfully' : 'Subscription not found or already inactive',
    });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
