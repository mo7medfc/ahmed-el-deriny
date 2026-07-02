# مطابع أحمد الدريني — Ahmed El-Deriny Printing

موقع احترافي للمطبعة مع دعم العربية والإنجليزية، حاسبة أسعار، رفع تصاميم، سلة تسوق، ولوحة تحكم.

## التشغيل

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

- **الموقع:** http://localhost:3000/ar
- **لوحة التحكم:** http://localhost:3000/admin

## بيانات الدخول (Admin)

- Email: `admin@ahmedderiny.com`
- Password: `Admin@123`

## المميزات

- 🌐 ثنائي اللغة (عربي / English) مع RTL
- 🎨 تصميم Dark + Blue احترافي
- 📐 حاسبة أسعار حسب المقاسات والكمية
- 📎 رفع ملفات التصميم (PDF, AI, PNG, JPG)
- 🛒 سلة تسوق وإتمام طلب
- 📊 لوحة تحكم — متابعة الطلبات والمنتجات
- 🖨️ منتجات: بانر، رول أب، أختام، كروت، فلايرات، بوسترات، تغليف

## اللوجو

ضع ملف اللوجو في: `public/logo/logo.png`

## الإنتاج

```bash
npm run build
npm start
```

غيّر `SESSION_SECRET` وكلمة مرور الأدمن في `.env` قبل النشر.
