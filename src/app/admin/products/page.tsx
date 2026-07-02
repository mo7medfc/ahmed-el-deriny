"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, Eye, EyeOff, DollarSign } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  basePrice: number;
  costPrice: number;
  pricingType: string;
  pricingCategory: string | null;
  isActive: boolean;
  featured: boolean;
  category: { nameAr: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts);
  };

  useEffect(() => { loadProducts(); }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    loadProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadProducts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المنتجات</h1>
          <p className="text-dark-400 text-sm mt-1">{products.length} منتج · مستورد من abdo gded</p>
        </div>
        <Link href="/admin/pricing">
          <Button className="gap-2">
            <DollarSign className="w-4 h-4" />
            إدارة التسعير
          </Button>
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-dark-400 border-b border-dark-700/50">
                <th className="text-start py-3 px-4">المنتج</th>
                <th className="text-start py-3 px-4">الفئة</th>
                <th className="text-start py-3 px-4">سعر البيع</th>
                <th className="text-start py-3 px-4">التكلفة</th>
                <th className="text-start py-3 px-4">النوع</th>
                <th className="text-start py-3 px-4">الحالة</th>
                <th className="text-start py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium">{product.nameAr}</p>
                    <p className="text-dark-400 text-xs">{product.nameEn}</p>
                  </td>
                  <td className="py-3 px-4 text-dark-300">{product.category.nameAr}</td>
                  <td className="py-3 px-4 text-brand-400">{product.basePrice} ج.م</td>
                  <td className="py-3 px-4 text-dark-400">{product.costPrice} ج.م</td>
                  <td className="py-3 px-4 text-dark-400">{product.pricingType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {product.isActive ? "نشط" : "معطل"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(product.id, product.isActive)}
                        className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300"
                        title={product.isActive ? "تعطيل" : "تفعيل"}
                      >
                        {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
