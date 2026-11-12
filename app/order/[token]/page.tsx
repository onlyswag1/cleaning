"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type OrderData = {
  id: string;
  status: string;
  name: string;
  address: string;
  estimatedTotal: number;
  finalPrice: number | null;
  agreedTime: string | null;
  comment: string | null;
  itemsJson: string;
  createdAt: string;
};

const formatPrice = (amount: number | null) =>
  amount ? new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount) : "—";

const statusLabels: Record<string, string> = {
  new: "Новая (ждет согласования)",
  agreed: "Согласована",
  completed: "Завершена",
  cancelled: "Отменена",
};

// 1. Выносим логику в отдельный компонент
function OrderContent() {
  const params = useParams();
  const token = params.token as string;
  
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/orders/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Заявка не найдена");
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-white text-center py-20">Загрузка...</div>;
  if (error) return <div className="text-red-400 text-center py-20">{error}</div>;
  if (!order) return null;

  const items = JSON.parse(order.itemsJson);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-gray-400 hover:text-white mb-6 inline-block">
        ← На главную
      </Link>

      <div className="rounded-[2.5rem] bg-[#1C2128] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Заявка #{order.id.slice(-4)}</h1>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            order.status === 'new' ? 'bg-blue-900 text-blue-200' :
            order.status === 'agreed' ? 'bg-green-900 text-green-200' :
            order.status === 'cancelled' ? 'bg-red-900 text-red-200' :
            'bg-gray-800 text-gray-300'
          }`}>
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400">Дата создания</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleString("ru-RU")}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Состав заказа</p>
            <ul className="mt-2 space-y-2">
              {items.map((item: any, i: number) => (
                <li key={i} className="flex justify-between border-b border-gray-700 pb-2">
                  <span>{item.name} ({item.options}) x{item.quantity}</span>
                  <span className="text-gray-400">{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Предварительная стоимость</span>
              <span className="text-xl font-bold">{formatPrice(order.estimatedTotal)}</span>
            </div>
            
            {order.status === 'agreed' && order.finalPrice && (
              <div className="mt-4 rounded-2xl bg-green-900/20 p-4 border border-green-800">
                <p className="text-sm text-green-400 font-medium">Согласованная стоимость</p>
                <p className="text-3xl font-extrabold text-green-300">{formatPrice(order.finalPrice)}</p>
                {order.agreedTime && (
                  <p className="mt-2 text-sm text-green-200">
                    <span className="font-semibold">Время выезда:</span> {order.agreedTime}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#12151A] p-4 text-sm text-gray-400">
            <p>Адрес: {order.address}</p>
            {order.comment && <p className="mt-2">Комментарий: {order.comment}</p>}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        Ссылка на эту страницу является приватной. Не передавайте её третьим лицам.
      </p>
    </div>
  );
}

// 2. Основной экспорт оборачивает контент в Suspense
export default function ClientOrderPage() {
  return (
    <main className="min-h-screen bg-[#0F1115] text-white font-sans p-6 md:p-12">
      <Suspense fallback={<div className="text-white text-center py-20">Загрузка заявки...</div>}>
        <OrderContent />
      </Suspense>
    </main>
  );
}