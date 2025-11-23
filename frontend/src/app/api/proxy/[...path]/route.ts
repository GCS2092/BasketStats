import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://192.168.1.118:3001';
    const imageUrl = `${backendUrl}/uploads/${path}`;

    console.log(`🖼️ [PROXY] Redirection image: ${imageUrl}`);

    // Rediriger vers l'image du backend
    return NextResponse.redirect(imageUrl, 302);
  } catch (error) {
    console.error('❌ [PROXY] Erreur proxy image:', error);
    return new NextResponse('Image non trouvée', { status: 404 });
  }
}
