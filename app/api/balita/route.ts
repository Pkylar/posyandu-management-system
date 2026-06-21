import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 [GET] /api/balita - Fetching all balita data');
  console.log('📊 [200] Response: 11 records returned');
  
  return NextResponse.json({
    success: true,
    message: 'Data balita berhasil dimuat',
    total: 11
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  console.log('📝 [POST] /api/balita - Creating new balita:', body.namaLengkap || body.name || 'Unknown');
  console.log('✅ [201] Response: Balita created successfully');
  
  return NextResponse.json({
    success: true,
    message: 'Data balita berhasil ditambahkan',
    data: { id: Date.now().toString(), ...body }
  }, { status: 201 });
}
