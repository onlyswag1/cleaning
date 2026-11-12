"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/orders'); // Перенаправляем в кабинет
    } else {
      setError('Неверный пароль');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1115] text-white">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-3xl bg-[#1C2128] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Вход в кабинет</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full rounded-xl border border-gray-700 bg-[#12151A] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#2B6CEB]"
        />
        <button type="submit" className="w-full rounded-xl bg-[#2B6CEB] py-3 font-semibold text-white hover:bg-blue-600">
          Войти
        </button>
      </form>
    </div>
  );
}