import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = file.name ? file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_') : 'file';
    const result = await uploadToCloudinary(buffer, 'babagraphic_uploads', `${filename}_${Date.now()}`);

    return NextResponse.json({
      url: result.url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Error uploading file to Cloudinary:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
