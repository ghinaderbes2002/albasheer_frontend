# توثيق API — مجمع البشير للكهربائيات
##(Frontend Developer)

---

## 📋 معلومات عامة

| البند | القيمة |
|-------|--------|
| Base URL (تطوير) | `http://localhost:8000` |
| Base URL (إنتاج) | `https://your-domain.com` |
| Content-Type | `application/json` |
| المصادقة | `Bearer Token` (JWT) |
| اللغة الافتراضية | العربية |

---

## 🔐 نظام المصادقة

### نوعان من المستخدمين:

| النوع | طريقة الدخول | الأدوار |
|-------|-------------|---------|
| **زبون** | OTP عبر رقم الهاتف | `customer` |
| **موظف** | رقم هاتف + كلمة مرور | `admin` / `branch_manager` / `delivery` / `content_manager` |

### تخزين التوكن:
احفظ `access` token في `localStorage` أو Zustand store واستخدمه في كل طلب:
```
Authorization: Bearer <access_token>
```

---

## 🗺️ خريطة الصفحات المطلوبة

```
الموقع العام (بدون تسجيل دخول):
├── / — الصفحة الرئيسية (منتجات مميزة + إعلانات)
├── /products — قائمة المنتجات
├── /products/:slug — تفاصيل منتج
├── /categories — الأقسام
├── /branches — الفروع وأماكنها
└── /cart — سلة المشتريات (local state)

الزبون (يحتاج تسجيل دخول):
├── /checkout — إتمام الطلب
├── /orders — طلباتي
├── /orders/:id — تفاصيل طلب
├── /orders/:id/tracking — تتبع الطلب
└── /profile — حسابي

الموظف (staff):
├── /staff/login — تسجيل دخول الموظفين
├── /staff/dashboard — لوحة التحكم
├── /staff/orders — إدارة الطلبات
├── /staff/orders/:id — تفاصيل طلب
└── /staff/delivery — طلبات التوصيل (للتوصيل فقط)
```

---

## 📡 جميع الـ APIs

---

### 1. 🔐 Auth — الزبون (OTP)

#### 1.1 طلب رمز OTP
```
POST /api/auth/request-code/
```
**Body:**
```json
{ "phone": "0912345678" }
```
**Response (200):**
```json
{ "detail": "تم إرسال رمز التحقق." }
```
**ملاحظة:** أرقام الهاتف تُقبل بصيغ: `09xxxxxxxx` أو `963xxxxxxxxx` أو `+963xxxxxxxxx`

---

#### 1.2 التحقق من OTP (تسجيل دخول / إنشاء حساب)
```
POST /api/auth/verify-code/
```
**Body:**
```json
{
  "phone": "0912345678",
  "code": "1234"
}
```
**Response (200):**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 1,
    "phone": "+963912345678",
    "first_name": "أحمد",
    "last_name": "محمد",
    "role": "customer"
  }
}
```
> 💡 إذا كان رقم الهاتف جديداً، يُنشئ حساباً تلقائياً.

---

#### 1.3 بيانات الزبون الحالي
```
GET /api/auth/me/
Authorization: Bearer <token>
```
**Response (200):**
```json
{
  "id": 1,
  "phone": "+963912345678",
  "first_name": "أحمد",
  "last_name": "محمد",
  "role": "customer"
}
```

---

#### 1.4 تحديث الملف الشخصي
```
PATCH /api/auth/me/
Authorization: Bearer <token>
```
**Body:**
```json
{
  "first_name": "أحمد",
  "last_name": "محمد"
}
```

---

### 2. 🔐 Auth — الموظفون (Password)

#### 2.1 تسجيل دخول الموظف
```
POST /api/auth/staff/login/
```
**Body:**
```json
{
  "phone": "0911111111",
  "password": "mypassword"
}
```
**Response (200):**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": 5,
    "phone": "+963911111111",
    "role": "branch_manager",
    "branch": { "id": 1, "name": "فرع حلب" }
  }
}
```

---

#### 2.2 تجديد التوكن
```
POST /api/auth/staff/refresh/
```
**Body:**
```json
{ "refresh": "eyJ..." }
```
**Response (200):**
```json
{ "access": "eyJ..." }
```

---

#### 2.3 بيانات الموظف الحالي
```
GET /api/auth/staff/me/
Authorization: Bearer <token>
```

---

### 3. 📍 العناوين

#### 3.1 قائمة عناوين الزبون
```
GET /api/addresses/
Authorization: Bearer <token>
```
**Response (200):**
```json
[
  {
    "id": 1,
    "label": "المنزل",
    "city": "حلب",
    "full_address": "حي الميدان، شارع النيل، بناء 12",
    "is_default": true,
    "created_at": "2026-05-01T10:00:00Z"
  }
]
```

---

#### 3.2 إضافة عنوان جديد
```
POST /api/addresses/
Authorization: Bearer <token>
```
**Body:**
```json
{
  "label": "المنزل",
  "city": "حلب",
  "full_address": "حي الميدان، شارع النيل، بناء 12"
}
```

---

#### 3.3 تعديل عنوان
```
PATCH /api/addresses/:id/
Authorization: Bearer <token>
```

---

#### 3.4 حذف عنوان
```
DELETE /api/addresses/:id/
Authorization: Bearer <token>
```

---

#### 3.5 تعيين عنوان افتراضي
```
POST /api/addresses/:id/set-default/
Authorization: Bearer <token>
```

---

### 4. 🏪 الفروع والمدن

#### 4.1 قائمة الفروع
```
GET /api/branches/
```
**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Aleppo Branch",
    "name_ar": "فرع حلب",
    "city": "حلب",
    "address": "شارع النيل، حلب",
    "phone": "0212345678",
    "maps_url": "https://maps.google.com/?q=36.2,37.1",
    "is_active": true
  }
]
```

---

#### 4.2 تفاصيل فرع
```
GET /api/branches/:id/
```

---

#### 4.3 قائمة المدن
```
GET /api/branches/cities/
```
**Response (200):**
```json
[
  { "id": 1, "name": "حلب", "requires_deposit": false },
  { "id": 2, "name": "دمشق", "requires_deposit": false },
  { "id": 3, "name": "حمص", "requires_deposit": false },
  { "id": 4, "name": "حماة", "requires_deposit": true },
  { "id": 5, "name": "إدلب", "requires_deposit": true }
]
```

> 💡 **مهم جداً للفرونت:**
> - `requires_deposit: false` → الزبون يدفع عند الاستلام، لا يحتاج رفع إيصال
> - `requires_deposit: true` → يجب على الزبون رفع إيصال دفع قبل قبول الطلب

---

### 5. 📦 المنتجات

#### 5.1 قائمة الأقسام
```
GET /api/products/categories/
```
**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Refrigerators",
    "name_ar": "الثلاجات",
    "slug": "refrigerators",
    "image": "http://localhost:8000/media/categories/fridge.jpg"
  }
]
```

---

#### 5.2 قائمة المنتجات
```
GET /api/products/
GET /api/products/?category=1
GET /api/products/?search=سامسونج
```
**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Samsung Fridge",
    "name_ar": "ثلاجة سامسونج",
    "slug": "ثلاجة-سامسونج-500",
    "price": "970000.00",
    "main_image": "http://localhost:8000/media/products/fridge.jpg",
    "category": { "id": 1, "name_ar": "الثلاجات" },
    "is_available": true
  }
]
```

---

#### 5.3 تفاصيل منتج
```
GET /api/products/:slug/
```
**Response (200):**
```json
{
  "id": 1,
  "name": "Samsung Fridge",
  "name_ar": "ثلاجة سامسونج",
  "slug": "ثلاجة-سامسونج-500",
  "description_ar": "ثلاجة سامسونج بسعة 500 لتر...",
  "price": "970000.00",
  "images": [
    { "id": 1, "image": "http://...", "is_main": true },
    { "id": 2, "image": "http://...", "is_main": false }
  ],
  "specs": [
    { "key": "السعة", "value": "500 لتر" },
    { "key": "اللون", "value": "فضي" }
  ],
  "is_available": true
}
```

---

#### 5.4 المنتجات المميزة
```
GET /api/products/featured/
```

---

#### 5.5 الباقات
```
GET /api/products/bundles/
GET /api/products/bundles/:id/
```

---

#### 5.6 الإعلانات
```
GET /api/ads/
```
**Response (200):**
```json
[
  {
    "id": 1,
    "title": "عروض الصيف",
    "image": "http://...",
    "link": "https://...",
    "is_active": true
  }
]
```

---

### 6. 🛒 الطلبات — الزبون

#### ⚡ منطق إنشاء الطلب (مهم جداً)

```
1. الزبون يختار المدينة من /api/branches/cities/
2. إذا requires_deposit = false:
   → الطلب يُنشأ بحالة "مؤكد" مباشرة
   → لا يحتاج رفع إيصال
   → يدفع عند الاستلام
3. إذا requires_deposit = true:
   → الطلب يُنشأ بحالة "قيد الانتظار"
   → يجب رفع إيصال الدفع
   → ينتظر موافقة مدير الفرع
```

---

#### 6.1 إنشاء طلب
```
POST /api/orders/
Authorization: Bearer <token>
```
**Body (مع عنوان محفوظ):**
```json
{
  "city": "حماة",
  "address_id": 1,
  "customer_note": "يرجى الاتصال قبل التوصيل",
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 3, "quantity": 2 }
  ]
}
```
**Body (مع عنوان جديد):**
```json
{
  "city": "حلب",
  "delivery_address": "حي الميدان، شارع النيل، بناء 12",
  "items": [
    { "product_id": 1, "quantity": 1 }
  ]
}
```
**Body (مع باقة):**
```json
{
  "city": "دمشق",
  "address_id": 1,
  "items": [],
  "bundle_items": [
    { "bundle_id": 1, "quantity": 1 }
  ]
}
```
**Response (201):**
```json
{
  "id": 37,
  "status": "pending",
  "total_price": "970000.00",
  "deposit_percent": "10.00",
  "deposit_amount": "97000.00",
  "shipping_fee": "0.00",
  "requires_deposit": true,
  "delivery_address": "حي الميدان...",
  "branch_name": "فرع حلب",
  "created_at": "2026-05-13T10:00:00Z"
}
```

> ⚠️ **ملاحظة:** `city` يجب أن تكون من القائمة المُرجعة من `/api/branches/cities/`

---

#### 6.2 رفع إيصال الدفع
```
POST /api/orders/:id/upload-receipt/
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Body (form-data):**
```
receipt_image: <file>
```
> 💡 هذا الـ endpoint مطلوب فقط إذا `requires_deposit = true`

---

#### 6.3 قائمة طلبات الزبون
```
GET /api/orders/
Authorization: Bearer <token>
```
**Response (200):**
```json
[
  {
    "id": 37,
    "status": "confirmed",
    "status_display": "مؤكد",
    "total_price": "970000.00",
    "deposit_amount": "97000.00",
    "shipping_fee": "5000.00",
    "branch_name": "فرع دمشق",
    "item_count": 2,
    "delivery_address": "حي الميدان...",
    "created_at": "2026-05-13T10:00:00Z"
  }
]
```

---

#### 6.4 تفاصيل طلب
```
GET /api/orders/:id/
Authorization: Bearer <token>
```
**Response (200):**
```json
{
  "id": 37,
  "status": "confirmed",
  "status_display": "مؤكد",
  "branch_name": "فرع دمشق",
  "total_price": "970000.00",
  "deposit_percent": "10.00",
  "deposit_amount": "97000.00",
  "shipping_fee": "5000.00",
  "requires_deposit": false,
  "delivery_address": "حي الميدان...",
  "customer_note": "يرجى الاتصال",
  "rejection_reason": "",
  "estimated_delivery": null,
  "receipt_image": null,
  "delivery_staff_name": "محمد علي",
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "ثلاجة سامسونج",
      "unit_price": "970000.00",
      "quantity": 1,
      "subtotal": "970000.00"
    }
  ],
  "bundle_items": [],
  "logs": [
    {
      "id": 1,
      "old_status": "",
      "new_status": "pending",
      "changed_by_name": null,
      "note": "",
      "changed_at": "2026-05-13T10:00:00Z"
    },
    {
      "id": 2,
      "old_status": "pending",
      "new_status": "confirmed",
      "changed_by_name": "أحمد مدير",
      "note": "",
      "changed_at": "2026-05-13T11:00:00Z"
    }
  ],
  "created_at": "2026-05-13T10:00:00Z",
  "updated_at": "2026-05-13T11:00:00Z"
}
```

---

#### 6.5 تتبع الطلب
```
GET /api/orders/:id/tracking/
Authorization: Bearer <token>
```
**Response (200):**
```json
{
  "current_status": "confirmed",
  "stages": [
    { "status": "pending", "label": "قيد الانتظار", "reached": true, "timestamp": "2026-05-13T10:00:00Z" },
    { "status": "confirmed", "label": "مؤكد", "reached": true, "timestamp": "2026-05-13T11:00:00Z" },
    { "status": "shipping", "label": "قيد الشحن", "reached": false, "timestamp": null },
    { "status": "delivered", "label": "تم التسليم", "reached": false, "timestamp": null }
  ]
}
```

---

#### 6.6 إلغاء طلب
```
POST /api/orders/:id/cancel/
Authorization: Bearer <token>
```
> ⚠️ يمكن الإلغاء فقط إذا كان الطلب بحالة `pending`

---

#### 6.7 تقييم الطلب (بعد التسليم)
```
POST /api/orders/:id/rate/
Authorization: Bearer <token>
```
**Body:**
```json
{
  "rating": 5,
  "comment": "خدمة ممتازة وتوصيل سريع"
}
```
> ⚠️ يمكن التقييم فقط بعد وصول الطلب لحالة `delivered`

---

### 7. 🏬 الطلبات — مدير الفرع

> 🔑 يحتاج token لمستخدم بدور `branch_manager`

#### 7.1 قائمة طلبات الفرع
```
GET /api/branch/orders/
Authorization: Bearer <staff_token>
```
> مدير الفرع يرى طلبات فرعه فقط تلقائياً.

---

#### 7.2 تفاصيل طلب
```
GET /api/branch/orders/:id/
Authorization: Bearer <staff_token>
```

---

#### 7.3 قبول الطلب
```
POST /api/branch/orders/:id/confirm/
Authorization: Bearer <staff_token>
```
> يُرسل إشعار واتساب للزبون تلقائياً ✅

---

#### 7.4 رفض الطلب
```
POST /api/branch/orders/:id/reject/
Authorization: Bearer <staff_token>
```
**Body:**
```json
{ "rejection_reason": "المنتج غير متوفر حالياً" }
```

---

#### 7.5 تحديد رسوم الشحن
```
PATCH /api/orders/branch/:id/set-shipping-fee/
Authorization: Bearer <staff_token>
```
**Body:**
```json
{ "shipping_fee": 5000 }
```
> يُرسل إشعار واتساب للزبون بالرسوم الجديدة ✅
> 
> رسوم الشحن = 0 لمدينة حلب تلقائياً

---

#### 7.6 تعيين موظف توصيل
```
POST /api/branch/orders/:id/assign-delivery/
Authorization: Bearer <staff_token>
```
**Body:**
```json
{ "delivery_user_id": 5 }
```

---

#### 7.7 تحديث حالة الطلب (عام)
```
POST /api/branch/orders/:id/ready/
Authorization: Bearer <staff_token>
```

---

### 8. 🚚 الطلبات — موظف التوصيل

> 🔑 يحتاج token لمستخدم بدور `delivery`

#### 8.1 قائمة طلبات التوصيل
```
GET /api/delivery/orders/
Authorization: Bearer <delivery_token>
```
> يرى الطلبات المسندة إليه فقط بحالات: `confirmed`, `shipping`, `delivered`

---

#### 8.2 بدء التوصيل
```
POST /api/delivery/orders/:id/start/
Authorization: Bearer <delivery_token>
```
**Body:**
```json
{ "estimated_delivery": "2026-05-13T14:00:00+03:00" }
```
> يُغير حالة الطلب إلى `shipping` ويُرسل إشعار واتساب للزبون ✅

---

#### 8.3 إتمام التسليم
```
POST /api/delivery/orders/:id/complete/
Authorization: Bearer <delivery_token>
```
> يُغير حالة الطلب إلى `delivered` ويُرسل إشعار واتساب للزبون ✅

---

## 🔄 دورة حياة الطلب الكاملة

```
┌─────────────────────────────────────────────────────────────┐
│                     دورة حياة الطلب                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  الزبون ينشئ الطلب                                         │
│       │                                                     │
│       ▼                                                     │
│  requires_deposit?                                          │
│  ┌────┴────┐                                               │
│  │  نعم   │  لا                                            │
│  ▼        ▼                                                 │
│ PENDING  CONFIRMED ◄── إشعار واتساب ✅                     │
│  │                                                          │
│  │ الزبون يرفع إيصال                                       │
│  │                                                          │
│  │ مدير الفرع يراجع                                        │
│  ├──────────────────► CANCELLED (رفض)                      │
│  │                                                          │
│  ▼                                                          │
│ CONFIRMED ◄── إشعار واتساب ✅                              │
│  │                                                          │
│  │ مدير الفرع يحدد رسوم الشحن ◄── إشعار واتساب ✅        │
│  │ مدير الفرع يعين موظف توصيل                             │
│  │                                                          │
│  ▼                                                          │
│ SHIPPING ◄── إشعار واتساب ✅ (موظف التوصيل يبدأ)          │
│  │                                                          │
│  ▼                                                          │
│ DELIVERED ◄── إشعار واتساب ✅                              │
│  │                                                          │
│  ▼                                                          │
│ الزبون يقيّم الطلب (اختياري)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ حالات الخطأ الشائعة

| الكود | المعنى | الحل |
|-------|--------|------|
| `401` | التوكن منتهي أو غير موجود | تجديد التوكن أو إعادة تسجيل الدخول |
| `403` | ليس لديك صلاحية | التحقق من دور المستخدم |
| `400` | خطأ في البيانات المرسلة | قراءة رسالة الخطأ في `detail` |
| `404` | العنصر غير موجود | التحقق من الـ ID |

**مثال على رسالة خطأ:**
```json
{ "detail": "يمكن تأكيد الطلبات بحالة \"قيد الانتظار\" فقط." }
```

---

## 💡 نصائح للتطوير

### 1. سلة المشتريات (Cart)
السلة تُخزَّن محلياً في الفرونت (Zustand) — لا يوجد API للسلة. عند الـ checkout يُرسَل الطلب مباشرة.

### 2. التحقق من المدينة
قبل إنشاء الطلب، اجلب قائمة المدن واعرضها كـ dropdown:
```javascript
// GET /api/branches/cities/
// اعرض: name — احفظ: name + requires_deposit
```

### 3. منطق الـ Checkout
```javascript
const city = selectedCity; // من القائمة
const requiresDeposit = city.requires_deposit;

if (requiresDeposit) {
  // اعرض: "يجب دفع عربون X ل.س"
  // اعرض: حقل رفع الإيصال
} else {
  // اعرض: "الدفع عند الاستلام"
  // لا تعرض حقل الإيصال
}
```

### 4. عرض رسوم الشحن
```javascript
// بعد إنشاء الطلب، راقب تغيير shipping_fee
// مدير الفرع سيدخلها وسيصل إشعار واتساب للزبون
// في صفحة تفاصيل الطلب اعرض: السعر الإجمالي + رسوم الشحن
```

### 5. تحديث حالة الطلب
للحصول على آخر تحديثات دون WebSocket:
```javascript
// كل 30 ثانية في صفحة تفاصيل الطلب
setInterval(() => {
  fetchOrderDetails(orderId);
}, 30000);
```

### 6. الصور
روابط الصور كاملة تأتي من الـ API مثل:
```
http://localhost:8000/media/products/image.jpg
```
في الإنتاج ستكون:
```
https://your-domain.com/media/products/image.jpg
```

---

## 🧪 بيانات تجريبية للاختبار

### حسابات موجودة (للتطوير):
| الدور | الرقم | كلمة المرور |
|-------|-------|-------------|
| Admin | يُنشأ بـ createsuperuser | - |
| Branch Manager | يُضاف من لوحة الأدمن | - |
| Delivery | يُضاف من لوحة الأدمن | - |

### مدن تجريبية (أضفها من لوحة الأدمن):
| المدينة | requires_deposit | الفرع |
|---------|-----------------|-------|
| حلب | false | فرع حلب (primary) |
| دمشق | false | فرع دمشق |
| حمص | false | فرع حمص |
| حماة | true | فرع حلب |
| إدلب | true | فرع حلب |
| اللاذقية | true | فرع حلب |

---

## 🔗 روابط مفيدة

| الرابط | الوصف |
|--------|-------|
| `http://localhost:8000/admin/` | لوحة الأدمن (جازمين) |
| `http://localhost:8000/api/` | Base URL للـ API |
| Postman Collection | مُرفقة مع هذه الوثيقة |
