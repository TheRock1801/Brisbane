import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth/session';
import { supabaseAdmin, TRIP_FILES_BUCKET } from '@/lib/supabase/server';

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  const folder = String(form.get('folder') ?? 'misc').replace(/[^a-z0-9-]/gi, '');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 413 });
  }

  const isPdf = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');
  if (!isPdf && !isImage) {
    return NextResponse.json({ error: 'unsupported_type' }, { status: 415 });
  }

  const ext = file.name.split('.').pop() || (isPdf ? 'pdf' : 'jpg');
  const path = `${folder}/${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabaseAdmin()
    .storage.from(TRIP_FILES_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin().storage.from(TRIP_FILES_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: data.publicUrl,
    fileType: isPdf ? 'pdf' : 'image',
  });
}
