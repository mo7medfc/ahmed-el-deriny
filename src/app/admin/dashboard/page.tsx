"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Package, Clock, DollarSign } from "lucide-react";

interface Stats {
  ordersCount: number;
  pendingOrders: number;
  productsCount: number;
  categoriesCount: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  printing: "bg-purple-500/20 text-purple-400",
  ready: "bg-green-500/20 text-green-400",
  delivered: "bg-brand-500/20 text-brand-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  printing: "قيد الطباعة",
  ready: "جاهز",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "إجمالي الطلبات", value: stats.ordersCount, icon: ShoppingCart, color: "text-brand-400" },
    { label: "طلبات معلقة", value: stats.pendingOrders, icon: Clock, color: "text-yellow-400" },
    { label: "المنتجات", value: stats.productsCount, icon: Package, color: "text-purple-400" },
    { label: "إجمالي الإيرادات", value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">لوحة التحكم</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-8 h-8 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-dark-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">آخر الطلبات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-dark-400 border-b border-dark-700/50">
                <th className="text-start py-3 px-2">رقم الطلب</th>
                <th className="text-start py-3 px-2">العميل</th>
                <th className="text-start py-3 px-2">المبلغ</th>
                <th className="text-start py-3 px-2">الحالة</th>
                <th className="text-start py-3 px-2">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                  <td className="py-3 px-2 text-brand-400 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-2 text-white">{order.customerName}</td>
                  <td className="py-3 px-2 text-white">{order.totalAmount.toLocaleString()} ج.م</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-dark-400">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
