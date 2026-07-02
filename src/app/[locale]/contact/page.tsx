import { getTranslations, getLocale, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const currentLocale = await getLocale();

  const contacts = [
    { icon: Phone, label: t("phone"), value: "+20 100 000 0000", dir: "ltr" as const },
    { icon: Mail, label: t("email"), value: "info@ahmedderiny.com", dir: "ltr" as const },
    { icon: MapPin, label: t("address"), value: currentLocale === "ar" ? "القاهرة، مصر" : "Cairo, Egypt" },
    { icon: Clock, label: t("hours"), value: t("hoursValue") },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("title")}</h1>
          <p className="text-dark-300">{t("subtitle")}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {contacts.map(({ icon: Icon, label, value, dir }) => (
            <div key={label} className="glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-dark-400 mb-1">{label}</h3>
              <p className="text-white font-semibold" dir={dir}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
