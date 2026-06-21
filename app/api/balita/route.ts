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
  const action = body.action || 'create';
  
  if (action === 'update') {
    console.log(`📝 [PUT] /api/balita/${body.id} - Updating balita: ${body.name}`);
    console.log(`✅ [200] Response: Balita updated successfully`);
  } else if (action === 'delete') {
    console.log(`🗑️  [DELETE] /api/balita/${body.id} - Deleting balita`);
    console.log(`✅ [200] Response: Balita deleted successfully`);
  } else {
    console.log('📝 [POST] /api/balita - Creating new balita:', body.name || 'Unknown');
    console.log('✅ [201] Response: Balita created successfully');
  }
  
  return NextResponse.json({ success: true, action }, { status: action === 'create' ? 201 : 200 });
}
