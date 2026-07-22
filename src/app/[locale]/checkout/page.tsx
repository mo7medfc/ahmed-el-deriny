"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle } from "lucide-react";
import { isStaticHosting } from "@/lib/pricing-url";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null);

  if (items.length === 0 && !success) {
    return (
      <div className="pt-28 pb-20 text-center">
        <p className="text-brand-500">{tCart("empty")}</p>
        <Link href="/products" className="inline-block mt-4">
          <Button>{tCart("continueShopping")}</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="pt-28 pb-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-brand-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-900 mb-2">{t("success")}</h1>
          <p className="text-brand-600 mb-4">{t("successDesc")}</p>
          <p className="text-brand-400 font-bold text-lg mb-6">
            {t("orderNumber")}: {success.orderNumber}
          </p>
          <Link href="/">
            <Button>{t("backHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    try {
      if (isStaticHosting()) {
        const orderNumber = `WEB-${Date.now().toString(36).toUpperCase()}`;
        clearCart();
        setSuccess({ orderNumber });
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          customerNotes: notes || undefined,
          locale,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            selectedOptions: JSON.stringify({
              options: item.selectedOptions,
              configuration: item.configuration,
            }),
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            designFile: item.designFile,
            notes: [item.notes, item.configuration?.summary].filter(Boolean).join("\n") || undefined,
          })),
          totalAmount: total,
        }),
      });

      const data = await res.json();
      if (data.orderNumber) {
        clearCart();
        setSuccess({ orderNumber: data.orderNumber });
      }
    } catch {
      alert("Error submitting order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-brand-900 mb-8">{t("title")}</h1>

        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-brand-600 text-sm mb-2">{items.length} items</p>
          <p className="text-2xl font-bold gradient-text">{formatPrice(total, locale)}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-brand-900 mb-2">{t("customerInfo")}</h2>
          <Input label={t("name")} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label={t("phone")} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" />
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1.5">{t("notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white border border-brand-200 text-brand-900 placeholder:text-brand-400 focus:border-brand-500 transition-all resize-none"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
