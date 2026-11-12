"use client";

import { useState } from "react";

type CategoryId = "sofas" | "armchairs" | "mattresses" | "chairs";

export type ServiceOption = {
  id: string;
  category: CategoryId;
  name: string;
  price: number;
};

type ServiceCategory = {
  id: CategoryId;
  name: string;
  description: string;
  startingPrice: number;
  icon: string;
  actionLabel: string;
  services: ServiceOption[];
};

type ServiceSelectorProps = {
  onAdd: (service: ServiceOption) => void;
};

const categories: ServiceCategory[] = [
  {
    id: "sofas",
    name: "Диваны",
    description: "От любимого двухместного до большого углового",
    startingPrice: 3200,
    icon: "🛋️",
    actionLabel: "диван",
    services: [
      { id: "sofa-2", category: "sofas", name: "2-местный диван", price: 3200 },
      { id: "sofa-3", category: "sofas", name: "3-местный диван", price: 4200 },
      { id: "sofa-corner", category: "sofas", name: "Угловой диван", price: 5500 },
    ],
  },
  {
    id: "armchairs",
    name: "Кресла",
    description: "Вернём свежесть любимому месту для отдыха",
    startingPrice: 1800,
    icon: "🪑",
    actionLabel: "кресло",
    services: [
      { id: "armchair-standard", category: "armchairs", name: "Стандартное кресло", price: 1800 },
      { id: "armchair-large", category: "armchairs", name: "Большое кресло", price: 2400 },
      { id: "armchair-pouf", category: "armchairs", name: "Пуф", price: 1000 },
    ],
  },
  {
    id: "mattresses",
    name: "Матрасы",
    description: "Глубокая чистка для спокойного и здорового сна",
    startingPrice: 2500,
    icon: "🛏️",
    actionLabel: "матрас",
    services: [
      { id: "mattress-single", category: "mattresses", name: "Односпальный матрас", price: 2500 },
      { id: "mattress-double", category: "mattresses", name: "Двуспальный матрас", price: 3800 },
      { id: "mattress-king", category: "mattresses", name: "Большой матрас", price: 4500 },
    ],
  },
  {
    id: "chairs",
    name: "Стулья",
    description: "Аккуратно очистим обивку и освежим ткань",
    startingPrice: 700,
    icon: "🪑",
    actionLabel: "стул",
    services: [
      { id: "chair-standard", category: "chairs", name: "Стул с мягким сиденьем", price: 700 },
      { id: "chair-back", category: "chairs", name: "Стул с мягкой спинкой", price: 1000 },
      { id: "chair-set", category: "chairs", name: "Комплект из 4 стульев", price: 2600 },
    ],
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);

export default function ServiceSelector({ onAdd }: ServiceSelectorProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>("sofas");
  const [selectedServiceId, setSelectedServiceId] = useState("sofa-2");

  const activeCategory = categories.find(
    (category) => category.id === activeCategoryId
  );

  const selectedService = activeCategory?.services.find(
    (service) => service.id === selectedServiceId
  );

  const selectCategory = (category: ServiceCategory) => {
    setActiveCategoryId(category.id);
    setSelectedServiceId(category.services[0].id);
  };

  return (
    <div className="mx-auto max-w-6xl py-6 text-[#2D2A26] sm:px-6 md:py-10 dark:text-slate-100">
      <header className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold tracking-wide text-[#2F5D50] shadow-sm ring-1 ring-[#E9E5DE] dark:bg-slate-800 dark:text-emerald-400 dark:ring-slate-700">
          <span aria-hidden="true">✦</span>
          Бережная химчистка у вас дома
        </span>

        <h1 className="text-5xl font-extrabold tracking-tight text-[#2D2A26] md:text-6xl dark:text-white">
          Чистка для мебели, которую любите
        </h1>

        <p className="mt-6 text-xl leading-8 text-[#6B6661] dark:text-slate-400">
          Приезжаем к вам домой. Москва и Подмосковье
        </p>
      </header>

      <section aria-labelledby="categories-heading">
        <div className="mb-8">
          <h2
            id="categories-heading"
            className="text-3xl font-bold tracking-tight text-[#2D2A26] dark:text-white"
          >
            Что будем чистить?
          </h2>
          <p className="mt-3 text-lg text-[#6B6661] dark:text-slate-400">
            Выберите мебель — подскажем стоимость и подходящий вариант.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectCategory(category)}
                className={`group relative flex flex-col items-start rounded-[2rem] border bg-white p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] sm:p-8 dark:bg-slate-900 ${
                  isActive
                    ? "border-[#2F5D50] ring-2 ring-[#2F5D50] dark:border-emerald-500 dark:ring-emerald-500"
                    : "border-transparent dark:border-slate-700"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F9F6F0] text-4xl transition-transform duration-300 group-hover:scale-110 dark:bg-slate-800"
                >
                  {category.icon}
                </span>

                <span className="block text-xl font-bold text-[#2D2A26] dark:text-white">
                  {category.name}
                </span>

                <span className="mt-3 block min-h-12 text-sm leading-relaxed text-[#6B6661] dark:text-slate-400">
                  {category.description}
                </span>

                <span className="mt-6 block text-base font-semibold text-[#2F5D50] dark:text-emerald-400">
                  От {formatPrice(category.startingPrice)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {activeCategory && (
        <section
          aria-labelledby="options-heading"
          className="mt-12 rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-10 md:mt-16 dark:bg-slate-900"
        >
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#2F5D50] dark:text-emerald-400">
              Подберите размер
            </p>
            <h2
              id="options-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-[#2D2A26] dark:text-white"
            >
              Варианты: {activeCategory.name.toLowerCase()}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {activeCategory.services.map((service) => {
              const isSelected = service.id === selectedServiceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`flex min-h-28 flex-col items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[#2F5D50] bg-[#F3F7F4] ring-2 ring-[#2F5D50] dark:border-emerald-500 dark:bg-emerald-900/20 dark:ring-emerald-500"
                      : "border-[#E9E5DE] bg-white hover:border-[#B8C9C0] hover:bg-[#FDFCFA] dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-lg font-semibold text-[#2D2A26] dark:text-white">
                    {service.name}
                  </span>
                  <span className="text-lg font-bold text-[#2F5D50] dark:text-emerald-400">
                    {formatPrice(service.price)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-stretch justify-between gap-6 border-t border-[#EEEAE4] pt-8 sm:flex-row sm:items-center dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-[#6B6661] dark:text-slate-400">Стоимость выбранной услуги</p>
              <p className="mt-2 text-3xl font-extrabold text-[#2D2A26] dark:text-white">
                {selectedService ? formatPrice(selectedService.price) : "—"}
              </p>
            </div>

            <button
              type="button"
              disabled={!selectedService}
              onClick={() => selectedService && onAdd(selectedService)}
              className="w-full rounded-2xl bg-[#2F5D50] px-10 py-5 text-lg font-bold text-white shadow-lg shadow-[#2F5D50]/20 transition-all duration-200 hover:bg-[#244A40] hover:shadow-xl hover:shadow-[#2F5D50]/30 focus:outline-none focus:ring-4 focus:ring-[#2F5D50]/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:shadow-emerald-600/20"
            >
              {`Выбрать ${activeCategory.actionLabel}`}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}