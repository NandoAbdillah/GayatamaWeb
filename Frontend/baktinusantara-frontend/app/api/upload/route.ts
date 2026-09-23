import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Berkas tidak ditemukan dalam permintaan',
        },
        { status: 400 }
      );
    }

    // Validation: Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ukuran berkas melebihi batas maksimum 10 MB',
        },
        { status: 400 }
      );
    }

    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format berkas tidak didukung. Harap unggah format JPG, PNG, atau PDF',
        },
        { status: 400 }
      );
    }

    // Proxy upload to Laravel backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = request.headers.get('authorization') || '';

    try {
      const backendFormData = new FormData();
      backendFormData.append('file', file);
      backendFormData.append('folder', category);
      backendFormData.append('disk', 'public');

      const backendResponse = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: token } : {}),
        },
        body: backendFormData,
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json({
          success: true,
          data: {
            file_url: data.data?.url || data.url,
            file_name: data.data?.filename || file.name,
            file_size: data.data?.size || file.size,
            mime_type: data.data?.mime_type || file.type,
            category,
            uploaded_at: new Date().toISOString(),
          },
          message: data.message || 'Berkas berhasil diunggah ke repositori',
        });
      } else {
        const errData = await backendResponse.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            message: errData.message || 'Gagal mengunggah berkas ke repositori server',
          },
          { status: backendResponse.status }
        );
      }
    } catch (backendErr: any) {
      return NextResponse.json(
        {
          success: false,
          message: 'Koneksi ke repositori berkas backend gagal: ' + (backendErr?.message || 'Server offline'),
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memproses unggahan berkas: ' + (error.message || 'Kesalahan server'),
      },
      { status: 500 }
    );
  }
}
