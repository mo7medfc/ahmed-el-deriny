"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, removeItem, clearCart, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-900 mb-2">{t("empty")}</h1>
          <p className="text-brand-700/60 mb-6">{t("emptyDesc")}</p>
          <Link href="/products">
            <Button>{t("continueShopping")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-brand-900">{t("title")}</h1>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            {t("clear")}
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-brand-900">{item.productName}</h3>
                  {item.width && item.height && (
                    <p className="text-sm text-brand-700/60 mt-1">
                      {item.width} × {item.height} {locale === "ar" ? "سم" : "cm"} × {item.quantity}
                    </p>
                  )}
                  {!item.width && (
                    <p className="text-sm text-brand-700/60 mt-1">
                      {locale === "ar" ? "الكمية" : "Qty"}: {item.quantity}
                    </p>
                  )}
                  {item.configuration?.summary && (
                    <p className="text-xs text-brand-600 mt-1">{item.configuration.summary}</p>
                  )}
                  {item.selectedOptions.length > 0 && (
                    <p className="text-xs text-brand-600 mt-1">
                      {item.selectedOptions.map((o) => o.name).join(", ")}
                    </p>
                  )}
                  {item.designFileName && (
                    <p className="text-xs text-brand-500 mt-1">📎 {item.designFileName}</p>
                  )}
                </div>
                <div className="text-end">
                  <p className="text-lg font-bold text-brand-700">{formatPrice(item.totalPrice, locale)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1 ms-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg text-brand-800">{t("total")}</span>
            <span className="text-2xl font-bold gradient-text">{formatPrice(total, locale)}</span>
          </div>
          <Link href="/checkout">
            <Button className="w-full" size="lg">
              {t("checkout")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
