"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CartDrawer, type CartItem } from "../components/CartDrawer";
import { CheckoutModal } from "../components/CheckoutModal";

const SofaScene = dynamic(() => import("../components/SofaScene").then((mod) => mod.SofaScene), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-gray-500">Загрузка 3D...</div>,
});

type CategoryId = "sofa" | "armchair" | "mattress" | "chair" | "other";
type Option = { id: string; name: string; price: number };
type Category = { id: CategoryId; name: string; options: Option[] };

const CATEGORIES: Category[] = [
  {
    id: "sofa",
    name: "Диван",
    options: [
      { id: "sofa-2", name: "2 места", price: 2000 },
      { id: "sofa-3", name: "3 места", price: 2400 },
      { id: "sofa-corner", name: "Угловой", price: 3200 },
    ],
  },
  {
    id: "armchair",
    name: "Кресло",
    options: [
      { id: "armchair-std", name: "Обычное", price: 1200 },
      { id: "armchair-recliner", name: "Реклайнер", price: 1800 },
    ],
  },
  {
    id: "mattress",
    name: "Матрас",
    options: [
      { id: "mattress-single", name: "Односпальный", price: 1400 },
      { id: "mattress-double", name: "Двуспальный", price: 2000 },
    ],
  },
  {
    id: "chair",
    name: "Стул",
    options: [
      { id: "chair-seat", name: "Сиденье", price: 350 },
      { id: "chair-back", name: "Сиденье и спинка", price: 500 },
    ],
  },
  {
    id: "other",
    name: "Другое",
    options: [
      { id: "other-item", name: "Оценка по фото", price: 0 },
    ],
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price);

export default function Page() {
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>("sofa");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("sofa-3");
  const [quantity, setQuantity] = useState(1);
  const [isDirty, setIsDirty] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cleaning-cart");
    if (saved) { try { setCartItems(JSON.parse(saved)); } catch (e) {} }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) { localStorage.setItem("cleaning-cart", JSON.stringify(cartItems)); }
  }, [cartItems, isMounted]);

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];
  const selectedOption = activeCategory.options.find((o) => o.id === selectedOptionId) || activeCategory.options[0];

  const isOther = activeCategoryId === "other";
  const basePrice = selectedOption.price;
  const dirtySurcharge = isDirty ? basePrice * 0.5 : 0;
  const totalPrice = (basePrice + dirtySurcharge) * quantity;

  const handleCategoryChange = (id: CategoryId) => {
    setActiveCategoryId(id);
    const newCategory = CATEGORIES.find((c) => c.id === id)!;
    setSelectedOptionId(newCategory.options[0].id);
    setQuantity(1);
    setIsDirty(false);
  };

  const handleAddToCart = () => {
    const optionsLabel = isOther ? "Оценка по фото" : `${selectedOption.name}${isDirty ? ", сильные загрязнения" : ""}`;
    const cartItemId = isOther ? `other-${Date.now()}` : `${selectedOption.id}-${isDirty ? "dirty" : "clean"}`;

    setCartItems((prev) => {
      if (isOther) {
        // Для "Другое" всегда добавляем новую позицию
        return [...prev, { id: cartItemId, name: "Другое", price: 0, quantity, options: "По фото" }];
      }
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) => item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { id: cartItemId, name: activeCategory.name, price: basePrice + dirtySurcharge, quantity, options: optionsLabel }];
    });

    setIsCartOpen(true);
    setQuantity(1);
    setIsDirty(false);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemoveItem = (id: string) => { setCartItems((prev) => prev.filter((item) => item.id !== id)); };
  const handleUndoRemove = (item: CartItem, index: number) => {
    setCartItems((prev) => { const newItems = [...prev]; newItems.splice(index, 0, item); return newItems; });
  };
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-[#0F1115] text-white font-sans antialiased">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:py-16">
        
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">Любимая мебель.<br /><span className="text-[#5E9EFF]">Снова свежая.</span></h1>
            <p className="mt-4 text-lg text-gray-400">Выберите мебель — рассчитаем чистку.</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 rounded-2xl bg-[#1C2128] px-5 py-3 font-semibold transition hover:bg-[#2A2F36]">
            <span>Корзина</span>
            {totalCartCount > 0 && (<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2B6CEB] text-xs text-white">{totalCartCount}</span>)}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#1C2128] min-h-[500px] lg:min-h-[700px]">
            {/* Передаем категорию в сцену */}
            {isOther ? (
              <div className="text-center text-gray-400">
                <p className="text-6xl mb-4">📸</p>
                <p>Оценка стоимости по фото</p>
                <p className="text-sm mt-2">Прикрепите фото при оформлении заказа</p>
              </div>
            ) : (
              <SofaScene category={activeCategoryId} />
            )}

            <div className="absolute bottom-6 flex gap-2 rounded-2xl bg-[#12151A]/90 p-2 backdrop-blur-sm">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => handleCategoryChange(cat.id)} className={`rounded-xl px-5 py-3 text-sm font-medium transition ${activeCategoryId === cat.id ? "bg-[#2B6CEB] text-white" : "text-gray-400 hover:text-white hover:bg-[#2A2F36]"}`}>{cat.name}</button>
              ))}
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[#1C2128] p-6 lg:p-8">
            <h2 className="text-3xl font-bold">{activeCategory.name}</h2>

            {isOther ? (
              <div className="mt-6">
                <textarea className="w-full rounded-xl border border-gray-700 bg-[#12151A] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B6CEB]" rows={4} placeholder="Опишите мебель (например: пуф, изголовье кровати)" />
                <p className="mt-2 text-sm text-gray-400">Стоимость будет рассчитана после просмотра фото.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap rounded-2xl bg-[#12151A] p-1">
                  {activeCategory.options.map((option) => (
                    <button key={option.id} onClick={() => setSelectedOptionId(option.id)} className={`flex-1 rounded-xl py-3 text-sm font-medium transition ${selectedOptionId === option.id ? "bg-[#2B6CEB] text-white" : "text-gray-400 hover:text-white"}`}>{option.name}</button>
                  ))}
                </div>

                <label className="mt-6 flex items-center justify-between cursor-pointer group">
                  <span className="text-gray-300 group-hover:text-white transition">Сильные загрязнения</span>
                  <div onClick={() => setIsDirty(!isDirty)} className={`h-6 w-6 rounded-full border-2 transition flex items-center justify-center ${isDirty ? "border-[#2B6CEB] bg-[#2B6CEB]" : "border-gray-600 hover:border-gray-400"}`}>{isDirty && <span className="text-white text-xs">✓</span>}</div>
                </label>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-gray-300">Количество</span>
                  <div className="flex items-center rounded-xl bg-[#12151A] p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-[#2A2F36] hover:text-white">−</button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-[#2A2F36] hover:text-white">+</button>
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 flex items-end justify-between border-t border-gray-700 pt-6">
              <span className="text-gray-400">Предварительно</span>
              <span className="text-4xl font-bold">{isOther ? "По фото" : formatPrice(totalPrice)}</span>
            </div>

            <button onClick={handleAddToCart} className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98]">
              Добавить в заказ <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onUndoRemove={handleUndoRemove} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cartItems} onSuccess={() => { setIsCheckoutOpen(false); setCartItems([]); localStorage.removeItem("cleaning-cart"); localStorage.removeItem("checkout-draft"); }} />
    </main>
  );
}