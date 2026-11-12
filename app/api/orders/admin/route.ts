import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все заявки
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }, // Новые сверху
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 });
  }
}

// Обновить заявку
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, finalPrice, agreedTime, ownerNote } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        finalPrice: finalPrice ? Number(finalPrice) : null,
        agreedTime,
        ownerNote,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}