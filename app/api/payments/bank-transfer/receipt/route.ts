import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_BODY_BYTES } from '@/lib/upload-limits';
import { enforcePublicRateLimit, rateLimitHeaders } from '@/lib/public-rate-limit';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { signCheckoutValue, readCheckoutValue, createTrackingToken } from '@/lib/checkout-security';
import { requireSameOrigin, RequestError, readMultipart } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';

function detectFileType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) {
    return { ext: '.png', mime: 'image/png' };
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2d) {
    return { ext: '.pdf', mime: 'application/pdf' };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if(!process.env.SUPABASE_SECRET_KEY)throw new RequestError("Private receipt uploads are not configured. Please contact Seedly before transferring payment.",503);
    const checkoutKey = request.headers.get('Idempotency-Key') || '';
    if (!/^[a-zA-Z0-9_-]{20,100}$/.test(checkoutKey)) return NextResponse.json({ error: { message: 'Please refresh checkout before uploading a receipt.' } }, { status: 400 });
    if (Number(request.headers.get('content-length') || 0) > MAX_UPLOAD_BODY_BYTES) return NextResponse.json({ error: { message: 'Receipt must be smaller than 4MB.' } }, { status: 413 });
    const quote = readCheckoutValue(request.headers.get("X-Checkout-Quote") || "");
    if(quote.purpose !== "quote")throw new RequestError("Please review your order before uploading a receipt.");
    await enforcePublicRateLimit(request, 'receipts');
    const formData = await readMultipart(request, MAX_UPLOAD_BODY_BYTES);
    const file = formData.get('receipt') as File | null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: { message: 'No receipt file provided' } }, { status: 400 });
    }

    // Size limit 4MB
    if (file.size > MAX_UPLOAD_FILE_BYTES) {
      return NextResponse.json({ error: { message: 'File size exceeds 4MB limit' } }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic-byte inspection
    const fileType = detectFileType(buffer);
    if (!fileType) {
      return NextResponse.json(
        { error: { message: 'Invalid file format. Only authentic JPG, PNG, and PDF receipts are accepted.' } },
        { status: 400 }
      );
    }

    // Generate secure unguessable storage filename
    const storagePath = "rcpt-" + createTrackingToken(checkoutKey, "receipt:" + crypto.createHash("sha256").update(buffer).digest("hex")) + fileType.ext;

    const receiptProof = signCheckoutValue({ purpose: "receipt", path: storagePath, key: checkoutKey, expires: Date.now() + 60 * 60_000 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(storagePath, buffer, {
        contentType: fileType.mime,
        upsert: false,
      });

    if (error && String(error.statusCode) !== "409") {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json(
        { error: { message: 'Failed to securely store receipt. Please try again.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        receipt_path: storagePath,
        filename: storagePath,
        receipt_proof: receiptProof,
      },
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: { message: error instanceof RequestError ? error.message : 'Failed to process receipt upload' } }, { status: error instanceof RequestError ? error.status : 500, headers: rateLimitHeaders(error) });
  }
}
