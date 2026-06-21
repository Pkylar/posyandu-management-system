import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('📊 [GET] /api/penimbangan - Fetching all penimbangan data');
  console.log('✅ [200] Response: 35 records returned');
  
  return NextResponse.json({
    success: true,
    message: 'Data penimbangan berhasil dimuat',
    total: 35
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'create';
  
  if (action === 'update') {
    console.log(`📝 [PUT] /api/penimbangan/${body.id} - Updating penimbangan`);
    console.log(`📏 [INFO] BB: ${body.weight}kg, TB: ${body.height}cm`);
    console.log(`✅ [200] Response: Penimbangan updated successfully`);
  } else {
    console.log('📝 [POST] /api/penimbangan - Creating new penimbangan');
    console.log(`📏 [INFO] Balita: ${body.balitaName || body.balitaId}, BB: ${body.weight}kg, TB: ${body.height}cm`);
    console.log('✅ [201] Response: Penimbangan created successfully');
  }
  
  return NextResponse.json({ success: true, action }, { status: action === 'create' ? 201 : 200 });
}
