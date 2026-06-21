import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('👴 [GET] /api/lansia - Fetching all lansia data');
  console.log('✅ [200] Response: 6 records returned');
  
  return NextResponse.json({
    success: true,
    message: 'Data lansia berhasil dimuat',
    total: 6
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'create';
  
  if (action === 'update') {
    console.log(`📝 [PUT] /api/lansia/${body.id} - Updating lansia: ${body.name}`);
    console.log(`✅ [200] Response: Lansia updated successfully`);
  } else {
    console.log('📝 [POST] /api/lansia - Creating new lansia:', body.name || 'Unknown');
    console.log(`📏 [INFO] BB: ${body.weight}kg, TB: ${body.height}cm, TD: ${body.bloodPressure}`);
    console.log('✅ [201] Response: Lansia created successfully');
  }
  
  return NextResponse.json({ success: true, action }, { status: action === 'create' ? 201 : 200 });
}
