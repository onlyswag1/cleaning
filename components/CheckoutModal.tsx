"use client";

import { useState, useEffect, useRef } from "react";
import { type CartItem } from "./CartDrawer";

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess: () => void;
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);

export function CheckoutModal({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    isOutsideCity: false,
    date: "",
    time: "",
    comment: "",
    agreement: false,
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("checkout-draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch (e) {
          console.error("Ошибка чтения черновика", e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem("checkout-draft", JSON.stringify(formData));
    }
  }, [formData, isOpen]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter((file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      );
      
      if (validFiles.length !== newFiles.length) {
        setErrors((prev) => ({ ...prev, photos: "Только JPEG, PNG и WebP" }));
      } else {
        setErrors((prev) => ({ ...prev, photos: "" }));
      }

      const totalFiles = [...photos, ...validFiles].slice(0, 3);
      setPhotos(totalFiles);
      
      const newPreviews = totalFiles.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    
    URL.revokeObjectURL(previews[index]);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Укажите имя";
    if (!formData.phone.trim()) newErrors.phone = "Укажите телефон";
    if (!formData.address.trim()) newErrors.address = "Укажите адрес";
    if (!formData.agreement) newErrors.agreement = "Необходимо согласие";
    if (formData.time && !formData.date) newErrors.date = "Для времени нужна дата";
    
    const hasOther = items.some(item => item.id.startsWith("other"));
    if (hasOther && photos.length === 0) {
      newErrors.photos = "Для услуги «Другое» нужно фото";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          isOutsideCity: formData.isOutsideCity,
          date: formData.date,
          time: formData.time,
          comment: formData.comment,
          items: items,
          total: total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      // Очищаем черновик
      localStorage.removeItem("checkout-draft");
      
      // Перенаправляем на страницу заявки
      window.location.href = data.privateLink;
      
      onSuccess();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#1C2128] text-white shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold">Оформление заказа</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Имя *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#12151A] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B6CEB] ${
                    errors.name ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="Иван"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#12151A] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B6CEB] ${
                    errors.phone ? "border-red-500" : "border-gray-700"
                  }`}
                  placeholder="+7 (999) 000-00-00"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Адрес *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-[#12151A] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B6CEB] ${
                  errors.address ? "border-red-500" : "border-gray-700"
                }`}
                placeholder="Улица, дом, квартира"
              />
              {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isOutsideCity"
                checked={formData.isOutsideCity}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-700 bg-[#12151A] text-[#2B6CEB] focus:ring-[#2B6CEB]"
              />
              <span className="text-sm text-gray-300">Выезд за город</span>
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Желаемая дата</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#12151A] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#2B6CEB] ${
                    errors.date ? "border-red-500" : "border-gray-700"
                  }`}
                />
                {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Время</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-700 bg-[#12151A] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#2B6CEB]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Комментарий</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-[#12151A] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B6CEB]"
                placeholder="Например: есть домашние животные"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Фото (до 3 шт.)</label>
              <div className="flex gap-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-700">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/80"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-dashed border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-300"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-[10px]">Добавить</span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoAdd}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />
              {errors.photos && <p className="mt-1 text-xs text-red-400">{errors.photos}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="agreement"
                checked={formData.agreement}
                onChange={handleChange}
                className="mt-1 h-5 w-5 shrink-0 rounded border-gray-700 bg-[#12151A] text-[#2B6CEB] focus:ring-[#2B6CEB]"
              />
              <span className="text-sm text-gray-300">
                Я согласен на обработку персональных данных и с условиями предоставления услуг
              </span>
            </label>
            {errors.agreement && <p className="mt-1 text-xs text-red-400">{errors.agreement}</p>}
          </form>
        </div>

        <div className="border-t border-gray-700 bg-[#12151A] p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-400">Итого к оплате</span>
            <span className="text-2xl font-bold">{formatPrice(total)}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
          >
            {isSubmitting ? "Отправка..." : "Отправить заявку"}
          </button>
        </div>

      </div>
    </div>
  );
}