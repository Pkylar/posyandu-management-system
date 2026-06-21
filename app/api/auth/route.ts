import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  
  if (body.action === 'login') {
    console.log('🔐 [POST] /api/auth - Login attempt for username:', body.username);
    console.log('✅ [200] Response: Login successful - Token generated');
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token: 'mock-token-' + Date.now()
    });
  }
  
  if (body.action === 'logout') {
    console.log('🚪 [POST] /api/auth - User logging out');
    console.log('✅ [200] Response: Logout successful');
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  }

  if (body.action === 'change-password') {
    console.log('🔑 [POST] /api/auth - Password change request');
    console.log('✅ [200] Response: Password changed successfully');
    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  }

  if (body.action === 'update-profile') {
    console.log('👤 [POST] /api/auth - Profile update request:', body.nama || 'Unknown');
    console.log('✅ [200] Response: Profile updated successfully');
    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui'
    });
  }

  return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
}
