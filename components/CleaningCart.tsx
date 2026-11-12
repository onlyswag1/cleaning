"use client";

import { useEffect, useRef, useState } from "react";

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
};

type PendingDeletion = {
  token: number;
  item: CartItem;
  index: number;
};

type CleaningCartProps = {
  items: CartItem[];
  currency?: string;
};

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export function CleaningCart({ items, currency = "RUB" }: CleaningCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(items);
  const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
  const nextToken = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    setCartItems(items);
  }, [items]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const changeQuantity = (id: CartItem["id"], change: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: CartItem["id"]) => {
    const index = cartItems.findIndex((item) => item.id === id);
    if (index === -1) return;
    const item = cartItems[index];
    const token = nextToken.current++;
    setCartItems((currentItems) =>
      currentItems.filter((cartItem) => cartItem.id !== id)
    );
    setPendingDeletions((current) => [...current, { token, item, index }]);
    const timer = setTimeout(() => {
      setPendingDeletions((current) =>
        current.filter((deletion) => deletion.token !== token)
      );
      timers.current.delete(token);
    }, 3000);
    timers.current.set(token, timer);
  };

  const undoRemoval = (deletion: PendingDeletion) => {
    const timer = timers.current.get(deletion.token);
    if (timer) clearTimeout(timer);
    timers.current.delete(deletion.token);
    setCartItems((currentItems) => {
      const restoredItems = [...currentItems];
      const insertAt = Math.min(deletion.index, restoredItems.length);
      restoredItems.splice(insertAt, 0, deletion.item);
      return restoredItems;
    });
    setPendingDeletions((current) =>
      current.filter((item) => item.token !== deletion.token)
    );
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5">
      <h2 className="text-2xl font-bold">Корзина</h2>
      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-[#1C2128]">
        <ul className="divide-y divide-gray-700">
          {cartItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-5">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-400">{formatPrice(item.price, currency)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl bg-[#12151A]">
                  <button onClick={() => changeQuantity(item.id, -1)} className="px-3 py-1 text-gray-400 hover:text-white">−</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="px-3 py-1 text-gray-400 hover:text-white">+</button>
                </div>
                <span className="font-semibold">{formatPrice(item.price * item.quantity, currency)}</span>
                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between bg-[#12151A] px-5 py-4">
          <span className="font-medium text-gray-400">Итого</span>
          <span className="text-xl font-bold">{formatPrice(total, currency)}</span>
        </div>
      </div>
    </section>
  );
}