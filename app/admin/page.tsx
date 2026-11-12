import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Как только пользователь заходит на /admin, его перекидывает на /admin/orders
  redirect('/admin/orders');
}