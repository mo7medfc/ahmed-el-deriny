"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  width: number | null;
  height: number | null;
  quantity: number;
  totalPrice: number;
  designFile: string | null;
  notes: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNotes: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const statuses = ["pending", "confirmed", "printing", "ready", "delivered", "cancelled"];
const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  printing: "قيد الطباعة",
  ready: "جاهز",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadOrders = () => {
    const url = filter ? `/api/admin/orders?status=${filter}` : "/api/admin/orders";
    fetch(url)
      .then((r) => r.json())
      .then(setOrders);
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">إدارة الطلبات</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-full text-sm ${!filter ? "gradient-bg text-white" : "bg-dark-800 text-dark-300"}`}
        >
          الكل
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm ${filter === s ? "gradient-bg text-white" : "bg-dark-800 text-dark-300"}`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="glass rounded-2xl overflow-hidden">
            <div
              className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-dark-800/30"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div>
                <p className="text-brand-400 font-bold">{order.orderNumber}</p>
                <p className="text-white text-sm">{order.customerName} — {order.customerPhone}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-white font-semibold">{order.totalAmount.toLocaleString()} ج.م</p>
                <select
                  value={order.status}
                  onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-dark-800 border border-dark-600 text-white text-sm rounded-lg px-3 py-1.5"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
                <span className="text-dark-400 text-xs">
                  {new Date(order.createdAt).toLocaleString("ar-EG")}
                </span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-dark-700/50 p-4 space-y-3">
                {order.customerEmail && <p className="text-sm text-dark-300">📧 {order.customerEmail}</p>}
                {order.customerNotes && <p className="text-sm text-dark-300">📝 {order.customerNotes}</p>}
                {order.items.map((item) => (
                  <div key={item.id} className="bg-dark-800/50 rounded-xl p-4">
                    <p className="text-white font-medium">{item.productName}</p>
                    {item.width && item.height && (
                      <p className="text-dark-400 text-sm">{item.width} × {item.height} سم × {item.quantity}</p>
                    )}
                    <p className="text-brand-400 text-sm">{item.totalPrice.toLocaleString()} ج.م</p>
                    {item.designFile && (
                      <a href={item.designFile} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-brand-400 mt-1 hover:underline">
                        <ExternalLink className="w-3 h-3" /> تحميل التصميم
                      </a>
                    )}
                    {item.notes && <p className="text-dark-400 text-xs mt-1">{item.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-dark-400 py-12">لا توجد طلبات</p>
        )}
      </div>
    </div>
  );
}
