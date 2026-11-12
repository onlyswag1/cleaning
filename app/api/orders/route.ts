import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total, isOutsideCity, date, time, comment } = body;

    // Простая валидация
    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    // Генерируем непредсказуемый токен для приватной ссылки
    const publicToken = randomBytes(16).toString('hex');

    const order = await prisma.order.create({
      data: {
        publicToken,
        name,
        phone,
        address,
        isOutsideCity: isOutsideCity || false,
        desiredDate: date ? new Date(date) : null,
        desiredTime: time || null,
        comment: comment || null,
        estimatedTotal: total,
        itemsJson: JSON.stringify(items),
        status: 'new',
      },
    });

    // В реальном проекте здесь была бы ссылка на домен
    const privateLink = `/order/${order.publicToken}`;

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      privateLink 
    });

  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}