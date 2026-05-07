# خارطة طريق مشروع البشير — Frontend

> **Backend:** Django REST Framework + PostgreSQL
> **Frontend:** React 19 + TypeScript + Vite + Tailwind v4
> **المرجع الرسمي للـ API:** [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md)
> **Postman Collection:** [albasheer_postman_collection.json](albasheer_postman_collection.json)

---

## 1. الـ Stack المعتمد

| الطبقة | التقنية |
|--------|---------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (مع دعم RTL) |
| UI Components | shadcn/ui + lucide-react (icons) |
| Routing | react-router-dom v7 |
| Server state | TanStack Query (React Query) |
| Client state | Zustand (auth + cart) |
| HTTP | Axios + interceptors |
| Forms | react-hook-form + zod |
| i18n | react-i18next (عربي / إنجليزي) |
| Notifications | react-hot-toast |
| Dates | date-fns |

---

## 2. تناقضات بين الـ API Guide والـ Postman (لازم تأكيد من الباك)

| الحقل | حسب الـ Guide | حسب الـ Postman |
|------|-------------|----------------|
| Profile name | `first_name` + `last_name` | `full_name` |
| Order body | `branch_id`, `product_id`, `customer_note`, `deposit_amount` | `branch`, `product`, `notes`, `deposit_percent` |
| Receipt method | `POST` | `PATCH` |
| Receipt field | `receipt` | `receipt_image` |
| OTP code length | 5 خانات | 4 خانات |

> **القرار المبدئي:** نمشي على الـ Guide ونعدّل عند أول اختبار حقيقي مع الباك.

---

## 3. أدوار المستخدمين

| Role | الوصف | الصفحات |
|------|-------|--------|
| `customer` | الزبون (الافتراضي) | الكتالوج + السلة + طلباتي |
| `branch_manager` | مدير فرع | لوحة الفرع |
| `delivery` | موظف توصيل | لوحة التوصيل |
| `admin` | مشرف عام | يستخدم Django admin مباشرة |

---

## 4. بنية المجلدات المقترحة

```
src/
├── api/                  # طبقة الاتصال مع الباك (functions تستدعي Axios)
│   ├── auth.ts
│   ├── products.ts
│   ├── branches.ts
│   └── orders.ts
├── components/           # كومبوننتس عامة قابلة لإعادة الاستخدام
│   ├── ui/               # shadcn/ui (button, input, dialog, ...)
│   └── shared/           # Header, Footer, LangSwitcher, RoleGuard, ...
├── features/             # مجموعات منطق متخصصة بـ feature
│   ├── auth/             # OTP form, Verify form, Profile form
│   ├── catalog/          # ProductCard, ProductGrid, Filters, ...
│   ├── cart/             # CartDrawer, CartItem, CartSummary
│   └── orders/           # OrderCard, StatusBadge, StatusTimeline
├── hooks/                # custom hooks (useAuth, useCart, useDebounce)
├── layouts/              # PublicLayout / CustomerLayout / DashboardLayout
├── lib/                  # utilities + setup
│   ├── api.ts            # Axios instance + interceptors
│   ├── i18n.ts           # إعداد react-i18next
│   ├── queryClient.ts    # TanStack Query client
│   ├── validators.ts     # zod schemas مشتركة
│   └── utils.ts          # cn(), formatPrice, formatDate, ...
├── locales/              # ملفات الترجمة
│   ├── ar.json
│   └── en.json
├── pages/                # صفحات الـ routes
│   ├── public/           # Home, Products, ProductDetail, Branches
│   ├── auth/             # Login, VerifyOtp, CompleteProfile
│   ├── customer/         # Cart, Checkout, MyOrders, OrderDetail, Profile
│   └── dashboard/        # BranchOrders, DeliveryOrders
├── routes/               # تعريف الـ router + Guards
│   ├── ProtectedRoute.tsx
│   ├── RoleGuard.tsx
│   └── index.tsx
├── store/                # Zustand stores
│   ├── auth.ts
│   └── cart.ts
├── types/                # TypeScript types مأخوذة من الـ API
│   └── api.ts
├── App.tsx
└── main.tsx
```

---

## 5. المراحل التفصيلية

### المرحلة 0 — التجهيز والبنية (Setup)
- [ ] تنظيف boilerplate (`App.tsx`, `App.css`, الـ assets الافتراضية)
- [ ] تركيب الـ dependencies الأساسية:
  - `react-router-dom`
  - `axios`
  - `@tanstack/react-query`, `@tanstack/react-query-devtools`
  - `zustand`
  - `react-hook-form`, `@hookform/resolvers`, `zod`
  - `react-i18next`, `i18next`, `i18next-browser-languagedetector`
  - `react-hot-toast`
  - `lucide-react`
  - `clsx`, `tailwind-merge`, `class-variance-authority`
  - `date-fns`
- [ ] تركيب shadcn CLI وإعدادها
- [ ] إنشاء بنية المجلدات الكاملة
- [ ] إعداد path alias `@/*`
- [ ] إعداد ملف `.env.example` و `.env.local` مع `VITE_API_BASE_URL`

### المرحلة 1 — البنية التحتية (Core)
- [ ] **Tailwind v4 + RTL:**
  - إعداد خط عربي (Cairo / Tajawal من Google Fonts)
  - تعريف design tokens (ألوان البراند، spacing، radius)
  - دعم تبديل الاتجاه `dir="rtl"` / `dir="ltr"` ديناميكياً
- [ ] **i18n:** ملفات `ar.json` و `en.json` + hook لتبديل اللغة + قلب الاتجاه
- [ ] **Axios instance** ([lib/api.ts](src/lib/api.ts)):
  - Base URL من `VITE_API_BASE_URL`
  - Request interceptor: إضافة `Authorization: Bearer ...`
  - Response interceptor: عند 401 → تجديد التوكن تلقائياً → retry
  - عند فشل التجديد → logout
- [ ] **TanStack Query client:** retries, staleTime, defaults
- [ ] **Auth store** ([store/auth.ts](src/store/auth.ts)):
  - `accessToken`, `refreshToken`, `user`, `role`
  - `login(tokens)`, `logout()`, `setUser()`
  - persist في `localStorage`
- [ ] **Routing:**
  - `ProtectedRoute` (يطلب تسجيل دخول)
  - `RoleGuard` (يطلب دور معين)
  - `PublicLayout`, `CustomerLayout`, `DashboardLayout`
- [ ] **Types:** كتابة TypeScript types لكل response من الـ API
- [ ] **Header عام:** logo + lang switch + login/profile menu + cart

### المرحلة 2 — المصادقة (Auth)
- [ ] صفحة `/login` — إدخال رقم الموبايل + زر "إرسال الكود"
- [ ] صفحة `/verify` — 5 خانات OTP + countdown 60 ثانية لإعادة الإرسال
- [ ] إذا `is_new: true` → توجيه لصفحة `/complete-profile` (الاسم + العنوان)
- [ ] صفحة `/profile` — عرض البيانات + تعديلها (PATCH `/api/auth/me/`)
- [ ] زر تسجيل الخروج (يمسح الـ tokens والـ store)
- [ ] معالجة كل حالات الخطأ: 400, 503, network error

### المرحلة 3 — الكتالوج العام (Public)
- [ ] صفحة `/` (Home):
  - Hero section
  - شريط التصنيفات (من `/api/products/categories/`)
  - عينة من المنتجات
- [ ] صفحة `/products`:
  - Grid للمنتجات
  - فلترة بالتصنيف (sidebar أو chips)
  - بحث (`?search=`) مع debounce
  - Pagination (12 منتج/صفحة)
  - Skeletons أثناء التحميل
- [ ] صفحة `/products/:slug`:
  - Image gallery (مع تحويل المسار النسبي لـ absolute)
  - الاسم + السعر + الوصف
  - جدول المواصفات (specs)
  - زر "أضف للسلة"
- [ ] صفحة `/branches`:
  - بطاقات الفروع (الاسم + المدينة + العنوان + هاتف)
  - زر للاتصال

### المرحلة 4 — السلة والطلبات (Customer)
- [ ] **Cart store** (Zustand + persist):
  - `addItem`, `removeItem`, `updateQuantity`, `clear`
  - حساب `subtotal` محلياً (للعرض فقط)
- [ ] CartDrawer أو صفحة `/cart` منفصلة
- [ ] صفحة `/checkout`:
  - اختيار الفرع (من `/api/branches/`)
  - عنوان التوصيل (افتراضي من الـ profile)
  - ملاحظة الزبون
  - مبلغ العربون
  - زر تأكيد → `POST /api/orders/`
  - بعد النجاح → الانتقال لصفحة الطلب لرفع الإيصال
- [ ] صفحة `/orders`:
  - قائمة طلباتي
  - فلترة بالحالة
  - StatusBadge ملوّن
- [ ] صفحة `/orders/:id`:
  - تفاصيل كاملة + المنتجات
  - StatusTimeline (من الـ logs)
  - رفع الإيصال (إذا `status === pending`)
  - عرض الإيصال المرفوع
  - معلومات موظف التوصيل (لما يصير `shipping`)

### المرحلة 5 — لوحة مدير الفرع (branch_manager)
- [ ] `/dashboard/branch` — قائمة طلبات الفرع (من `/api/orders/branch/`)
- [ ] فلاتر: حسب الحالة، تاريخ
- [ ] صفحة تفاصيل الطلب من زاوية المدير:
  - عرض إيصال الزبون
  - زر تأكيد (`pending → confirmed`)
  - زر إلغاء مع `rejection_reason` (modal)
  - زر "بدء التحضير" (`confirmed → preparing`)
  - عند `preparing` → modal لاختيار موظف التوصيل وتحديد `estimated_delivery`
- [ ] إضافة `note` مع كل تغيير حالة (يظهر في الـ logs)

### المرحلة 6 — لوحة التوصيل (delivery)
- [ ] `/dashboard/delivery` — الطلبات المسندة (من `/api/orders/delivery/`)
- [ ] StatusBadge + معلومات الزبون + العنوان + رقم الموبايل
- [ ] زر "بدء التوصيل" (`confirmed/preparing → shipping`)
  - تنبيه: هاد الانتقال يبعت WhatsApp للزبون أوتوماتيكياً
- [ ] زر "تم التسليم" (`shipping → delivered`)

### المرحلة 7 — التشطيب (Polish)
- [ ] Loading skeletons لكل قائمة/تفاصيل
- [ ] Empty states (سلة فارغة، لا يوجد طلبات، لا يوجد منتجات)
- [ ] Error boundary عام + صفحة 404 + صفحة 403
- [ ] Toasts للنجاح/الخطأ في كل العمليات
- [ ] Responsive كامل (موبايل أولاً)
- [ ] اختبار RTL/LTR على كل الصفحات
- [ ] Lighthouse audit (performance, a11y, SEO)
- [ ] إعداد build production + متغيرات البيئة للنشر
- [ ] README بتعليمات التشغيل

---

## 6. مبادئ عامة نلتزم فيها

1. **TypeScript strict** — ممنوع `any` إلا للضرورة القصوى.
2. **كل API call عبر TanStack Query** (`useQuery` للـ GET، `useMutation` للباقي).
3. **Forms كلها react-hook-form + zod** للتحقق.
4. **الترجمة:** ممنوع نص hardcoded — كل شي عبر `t('key')`.
5. **الأسعار:** نتعامل معها كـ string ونستخدم helper `formatPrice()` للعرض.
6. **التواريخ:** ISO من السيرفر → نحوّل بـ date-fns لتوقيت المستخدم.
7. **Components صغيرة:** فضّل التقسيم على الـ god components.
8. **Accessibility:** كل button له aria-label إذا ما عنده نص، كل input له label.
9. **Mobile-first** في كل الـ Tailwind classes.

---

## 7. متغيرات البيئة (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_MEDIA_BASE_URL=http://localhost:8000
```

---

## 8. أوامر مفيدة

```bash
npm run dev      # تشغيل dev server على البورت 5173
npm run build    # build للإنتاج
npm run lint     # فحص الـ code
npm run preview  # معاينة الـ build
```
