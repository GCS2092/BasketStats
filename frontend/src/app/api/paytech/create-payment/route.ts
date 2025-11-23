import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      item_name, 
      item_price, 
      currency, 
      ref_command, 
      command_name, 
      custom_field,
      target_payment 
    } = body;

    // Validate required fields
    if (!item_name || !item_price || !ref_command) {
      return NextResponse.json(
        { success: false, message: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Prepare payment data for backend
    const paymentData = {
      item_name,
      item_price,
      currency: currency || 'XOF',
      ref_command,
      command_name: command_name || item_name,
      custom_field,
      target_payment,
      env: 'test', // Use test environment by default
    };

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/paytech/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Erreur du serveur' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error in create-payment:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
