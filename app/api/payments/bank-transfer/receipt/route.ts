import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function detectFileType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { ext: '.png', mime: 'image/png' };
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { ext: '.pdf', mime: 'application/pdf' };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File | null;

    if (!file) {
      return NextResponse.json({ error: { message: 'No receipt file provided' } }, { status: 400 });
    }

    // Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: { message: 'File size exceeds 5MB limit' } }, { status: 400 });
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
    const storagePath = `rcpt-${crypto.randomUUID()}${fileType.ext}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(storagePath, buffer, {
        contentType: fileType.mime,
        upsert: false,
      });

    if (error) {
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
      },
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: { message: 'Failed to process receipt upload' } }, { status: 500 });
  }
}
