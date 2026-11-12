"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Order = {
  id: string;
  publicToken: string;
  status: string;
  name: string;
  phone: string;
  address: string;
  estimatedTotal: number;
  finalPrice: number | null;
  agreedTime: string | null;
  comment: string | null;
  ownerNote: string | null;
  itemsJson: string;
  createdAt: string;
};

const formatPrice = (amount: number | null) =>
  amount ? new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount) : "—";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Загрузка заявок
  const fetchOrders = async () => {
    setIsLoading(true);
    const res = await fetch("/api/orders/admin");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Обновление заявки
  const handleUpdateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as string;
    const finalPrice = formData.get("finalPrice") as string;
    const agreedTime = formData.get("agreedTime") as string;
    const ownerNote = formData.get("ownerNote") as string;

    const res = await fetch("/api/orders/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedOrder.id, status, finalPrice, agreedTime, ownerNote }),
    });

    if (res.ok) {
      setSelectedOrder(null);
      fetchOrders(); // Обновляем список
    }
  };

  // Фильтрация
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = order.name.toLowerCase().includes(search.toLowerCase()) || order.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  if (isLoading) return <div className="p-10 text-white">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        
        {/* Шапка */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold">Заявки</h1>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Поиск по имени или телефону..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-700 bg-[#1C2128] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6CEB]"
            />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gray-700 bg-[#1C2128] px-4 py-2 text-sm focus:outline-none"
            >
              <option value="all">Все</option>
              <option value="new">Новые</option>
              <option value="agreed">Согласованы</option>
              <option value="completed">Завершены</option>
              <option value="cancelled">Отменены</option>
            </select>
          </div>
        </div>

        {/* Список заявок */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = JSON.parse(order.itemsJson);
            return (
              <div key={order.id} className="rounded-3xl bg-[#1C2128] p-6 border border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'new' ? 'bg-blue-900 text-blue-200' :
                      order.status === 'agreed' ? 'bg-green-900 text-green-200' :
                      order.status === 'cancelled' ? 'bg-red-900 text-red-200' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
                  >
                    Редактировать
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-400">Клиент</p>
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-[#5E9EFF]">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Адрес</p>
                    <p className="text-sm">{order.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Предварительно</p>
                    <p className="text-xl font-bold">{formatPrice(order.estimatedTotal)}</p>
                    {order.finalPrice && <p className="text-sm text-green-400">Итог: {formatPrice(order.finalPrice)}</p>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Состав:</p>
                  <ul className="text-sm space-y-1">
                    {items.map((item: any, i: number) => (
                      <li key={i}>• {item.name} ({item.options}) — {item.quantity} шт.</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && <p className="text-center text-gray-500 py-10">Заявок нет</p>}
        </div>
      </div>

      {/* Модалка редактирования */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#1C2128] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Заявка от {selectedOrder.name}</h2>
            
            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Статус</label>
                <select name="status" defaultValue={selectedOrder.status} className="w-full rounded-xl border border-gray-700 bg-[#12151A] p-3 mt-1">
                  <option value="new">Новая</option>
                  <option value="agreed">Согласована</option>
                  <option value="completed">Завершена</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Итоговая цена (₽)</label>
                <input name="finalPrice" type="number" defaultValue={selectedOrder.finalPrice || ""} className="w-full rounded-xl border border-gray-700 bg-[#12151A] p-3 mt-1" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Согласованное время</label>
                <input name="agreedTime" type="text" defaultValue={selectedOrder.agreedTime || ""} placeholder="Например: 15 ноября, 14:00" className="w-full rounded-xl border border-gray-700 bg-[#12151A] p-3 mt-1" />
              </div>

              <div>
                <label className="text-sm text-gray-400">Приватная заметка</label>
                <textarea name="ownerNote" defaultValue={selectedOrder.ownerNote || ""} rows={2} className="w-full rounded-xl border border-gray-700 bg-[#12151A] p-3 mt-1" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedOrder(null)} className="flex-1 rounded-xl bg-gray-700 py-3 font-semibold hover:bg-gray-600">Отмена</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#2B6CEB] py-3 font-semibold hover:bg-blue-600">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}