import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();

  // Сравниваем с паролем из .env
  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // Ставим httpOnly cookie (безопасно, нельзя украсть через JS)
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 день
      path: '/',
    });
    
    return response;
  }

  return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
}