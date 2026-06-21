import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('💉 [GET] /api/vitamin-vaksin - Fetching all vitamin/vaksin data');
  console.log('✅ [200] Response: 15 records returned');
  
  return NextResponse.json({
    success: true,
    message: 'Data vitamin/vaksin berhasil dimuat',
    total: 15
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  console.log('💉 [POST] /api/vitamin-vaksin - Creating new vitamin/vaksin:', body.name || 'Unknown');
  console.log(`📋 [INFO] Type: ${body.type}, Recipient: ${body.recipientName}`);
  console.log('✅ [201] Response: Vitamin/vaksin created successfully');
  
  return NextResponse.json({
    success: true,
    message: 'Data vitamin/vaksin berhasil ditambahkan',
    data: { id: Date.now().toString(), ...body }
  }, { status: 201 });
}
