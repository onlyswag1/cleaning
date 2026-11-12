"use client";

import { useEffect, useRef, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
};

type PendingDeletion = {
  token: number;
  item: CartItem;
  index: number;
};

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onUndoRemove: (item: CartItem, index: number) => void;
  onCheckout: () => void; // <--- ДОБАВЛЕНО
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUndoRemove,
  onCheckout, // <--- ДОБАВЛЕНО
}: CartDrawerProps) {
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const nextToken = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const handleRemove = (item: CartItem, index: number) => {
    onRemoveItem(item.id);
    const token = nextToken.current++;
    setPendingDeletions((current) => [...current, { token, item, index }]);

    const timer = setTimeout(() => {
      setPendingDeletions((current) =>
        current.filter((deletion) => deletion.token !== token)
      );
      timers.current.delete(token);
    }, 3000);

    timers.current.set(token, timer);
  };

  const handleUndo = (deletion: PendingDeletion) => {
    const timer = timers.current.get(deletion.token);
    if (timer) clearTimeout(timer);
    timers.current.delete(deletion.token);

    onUndoRemove(deletion.item, deletion.index);
    setPendingDeletions((current) =>
      current.filter((item) => item.token !== deletion.token)
    );
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[#1C2128] text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold">Ваш заказ</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-[#12151A] p-6 text-4xl">🛒</div>
              <p className="text-lg font-medium">Пока пусто</p>
              <p className="mt-2 text-sm text-gray-400">
                Добавьте мебель из каталога, чтобы рассчитать стоимость.
              </p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item, index) => (
                <li key={item.id} className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    {item.options && (
                      <p className="text-sm text-gray-400">{item.options}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      {formatPrice(item.price)} / шт.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center rounded-xl bg-[#12151A] p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#2A2F36] hover:text-white"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#2A2F36] hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => handleRemove(item, index)}
                      className="text-xs text-gray-500 hover:text-red-400"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-700 bg-[#12151A] p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-400">Итого</span>
              <span className="text-3xl font-bold">{formatPrice(total)}</span>
            </div>
            
            {/* ВОТ ЗДЕСЬ ПРИВЯЗАН onCheckout */}
            <button 
              onClick={onCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98]"
            >
              Перейти к оформлению
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Оплата при встрече с мастером. Это предварительная стоимость.
            </p>
          </div>
        )}

        {pendingDeletions.length > 0 && (
          <div className="absolute bottom-24 left-6 right-6 space-y-2">
            {pendingDeletions.map((deletion) => (
              <div
                key={deletion.token}
                className="flex items-center justify-between rounded-xl bg-[#2B6CEB] px-4 py-3 text-sm text-white shadow-lg"
              >
                <span className="truncate">«{deletion.item.name}» удалено</span>
                <button
                  onClick={() => handleUndo(deletion)}
                  className="ml-4 font-semibold underline hover:text-blue-200"
                >
                  Отменить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}