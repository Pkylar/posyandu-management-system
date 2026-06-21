import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('📊 [GET] /api/dashboard - Fetching dashboard statistics');
  console.log('📋 [STATS] Balita: 11, Ibu Menyusui: 8, Lansia: 6, Stunting: 3');
  console.log('✅ [200] Response: Dashboard data loaded');
  
  return NextResponse.json({
    success: true,
    message: 'Data dashboard berhasil dimuat',
    data: {
      totalBalita: 11,
      totalIbuMenyusui: 8,
      totalLansia: 6,
      totalStunting: 3
    }
  });
}
