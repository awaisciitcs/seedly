import { MAX_UPLOAD_FILE_BYTES, MAX_UPLOAD_BODY_BYTES } from '@/lib/upload-limits';
import { readAdminJson, AdminInputError, adminId, adminText } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { getScopedClient } from '@/lib/supabase/admin';
import { readMultipart, requireSameOrigin } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';

function detectImageType(buffer: Buffer, originalName?: string): { ext: string; mime: string } | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) {
    return { ext: '.png', mime: 'image/png' };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: '.webp', mime: 'image/webp' };
  }

  // GIF: 47 49 46 38
  if (buffer.subarray(0,6).toString('ascii') === 'GIF87a' || buffer.subarray(0,6).toString('ascii') === 'GIF89a') {
    return { ext: '.gif', mime: 'image/gif' };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    requireSameOrigin(request);
    const formData = await readMultipart(request, MAX_UPLOAD_BODY_BYTES);
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: { message: 'No image file provided' } }, { status: 400 });
    }

    // Size limit 4MB
    if (file.size > MAX_UPLOAD_FILE_BYTES) {
      return NextResponse.json({ error: { message: 'Image size exceeds 4MB limit' } }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileType = detectImageType(buffer, file.name);
    if (!fileType) {
      return NextResponse.json(
        { error: { message: 'Invalid image format. Supported formats: JPG, PNG, WebP, and GIF.' } },
        { status: 400 }
      );
    }

    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30);
    const storagePath = `catalog/${Date.now()}-${cleanBaseName}-${crypto.randomBytes(4).toString('hex')}${fileType.ext}`;

    const supabase = await getScopedClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: fileType.mime,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage product image upload error:', uploadError);
      return NextResponse.json(
        { error: { message: 'Image storage is temporarily unavailable. Please try again.' } },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrlData.publicUrl,
        filename: storagePath,
      },
    });
  } catch (error: any) {
    if (error instanceof AdminAuthError || error instanceof AdminInputError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Admin image upload error:', error);
    return NextResponse.json({ error: { message: 'Image upload failed. Please check the file and try again.' } }, { status: 500 });
  }
}
