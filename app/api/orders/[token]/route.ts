import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const order = await prisma.order.findUnique({
      where: { publicToken: token },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Возвращаем только безопасные для клиента данные (без ownerNote)
    return NextResponse.json({
      id: order.id,
      status: order.status,
      name: order.name,
      address: order.address,
      estimatedTotal: order.estimatedTotal,
      finalPrice: order.finalPrice,
      agreedTime: order.agreedTime,
      comment: order.comment,
      itemsJson: order.itemsJson,
      createdAt: order.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}