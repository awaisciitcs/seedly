import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const filename = `receipt-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicPath = `/uploads/receipts/${filename}`;

    return NextResponse.json({
      data: {
        receipt_path: publicPath,
        filename,
      },
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: { message: 'Failed to process receipt upload' } }, { status: 500 });
  }
}
