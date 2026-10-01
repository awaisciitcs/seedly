import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireAdmin, AdminAuthError } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function detectImageType(buffer: Buffer, originalName?: string): { ext: string; mime: string } | null {
  if (buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: '.jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
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
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { ext: '.gif', mime: 'image/gif' };
  }

  // SVG: starts with <svg or <?xml (or filename ends with .svg)
  const prefix = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
  if (prefix.includes('<svg') || prefix.startsWith('<?xml') || originalName?.toLowerCase().endsWith('.svg')) {
    return { ext: '.svg', mime: 'image/svg+xml' };
  }

  // Fallback to extension check if buffer is valid
  if (originalName) {
    const lower = originalName.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return { ext: '.jpg', mime: 'image/jpeg' };
    if (lower.endsWith('.png')) return { ext: '.png', mime: 'image/png' };
    if (lower.endsWith('.webp')) return { ext: '.webp', mime: 'image/webp' };
    if (lower.endsWith('.svg')) return { ext: '.svg', mime: 'image/svg+xml' };
    if (lower.endsWith('.gif')) return { ext: '.gif', mime: 'image/gif' };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return NextResponse.json({ error: { message: 'No image file provided' } }, { status: 400 });
    }

    // Size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: { message: 'Image size exceeds 10MB limit' } }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileType = detectImageType(buffer, file.name);
    if (!fileType) {
      return NextResponse.json(
        { error: { message: 'Invalid image format. Supported formats: JPG, PNG, WebP, SVG, and GIF.' } },
        { status: 400 }
      );
    }

    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30);
    const storagePath = `catalog/${Date.now()}-${cleanBaseName}-${crypto.randomBytes(4).toString('hex')}${fileType.ext}`;

    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: fileType.mime,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage product image upload error:', uploadError);
      return NextResponse.json(
        { error: { message: `Storage upload failed: ${uploadError.message}` } },
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
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    console.error('Admin image upload error:', error);
    return NextResponse.json({ error: { message: error.message || 'Image upload failed' } }, { status: 500 });
  }
}
