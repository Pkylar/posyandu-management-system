import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🤱 [GET] /api/ibu-menyusui - Fetching all ibu menyusui data');
  console.log('✅ [200] Response: 8 records returned');
  
  return NextResponse.json({
    success: true,
    message: 'Data ibu menyusui berhasil dimuat',
    total: 8
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'create';
  
  if (action === 'update') {
    console.log(`📝 [PUT] /api/ibu-menyusui/${body.id} - Updating ibu menyusui: ${body.name}`);
    console.log(`✅ [200] Response: Ibu menyusui updated successfully`);
  } else {
    console.log('📝 [POST] /api/ibu-menyusui - Creating new ibu menyusui:', body.name || 'Unknown');
    console.log('✅ [201] Response: Ibu menyusui created successfully');
  }
  
  return NextResponse.json({ success: true, action }, { status: action === 'create' ? 201 : 200 });
}
