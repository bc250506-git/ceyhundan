import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Debug logging
    console.log('Login attempt:', { username, damlaPwd: env.DAMLA_PASSWORD, ceyhundanPwd: env.CEYHUNDAN_PASSWORD });
    
    // Validate username and password
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı ve parola gerekli' },
        { status: 400 }
      );
    }
    
    // Check credentials for Damla
    if (username === 'damla') {
      console.log('Damla login check:', { provided: password, stored: env.DAMLA_PASSWORD, match: password === env.DAMLA_PASSWORD });
      if (password === env.DAMLA_PASSWORD) {
        return NextResponse.json(
          { success: true, message: 'Giriş başarılı', user: 'damla' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: 'Parola hatalı' },
          { status: 401 }
        );
      }
    }
    
    // Check credentials for Ceyhundan
    if (username === 'ceyhundan') {
      console.log('Ceyhundan login check:', { provided: password, stored: env.CEYHUNDAN_PASSWORD, match: password === env.CEYHUNDAN_PASSWORD });
      if (password === env.CEYHUNDAN_PASSWORD) {
        return NextResponse.json(
          { success: true, message: 'Giriş başarılı', user: 'ceyhundan' },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: 'Parola hatalı' },
          { status: 401 }
        );
      }
    }
    
    // If username doesn't match any user
    return NextResponse.json(
      { success: false, message: 'Kullanıcı adı hatalı' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
} 