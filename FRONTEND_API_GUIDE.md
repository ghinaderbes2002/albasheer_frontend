# دليل الـ API لفريق الفرونت — مشروع البشير

> Backend: Django REST Framework + PostgreSQL
> Frontend المتوقع: Vue.js / Vite

---

## 1. معلومات أساسية

| العنصر | القيمة |
|--------|--------|
| **Base URL (تطوير)** | `http://localhost:8000` |
| **Media URL** | `http://localhost:8000/media/...` |
| **نوع المصادقة** | JWT (Bearer Token) |
| **Access Token Lifetime** | 1 يوم |
| **Refresh Token Lifetime** | 30 يوم |
| **حجم الصفحة (Pagination)** | 12 |
| **اللغة** | عربي / إنجليزي (ثنائي) |
| **Timezone** | `Asia/Damascus` |
| **CORS مسموح** | `http://localhost:5173`, `http://127.0.0.1:5173` |

### Headers المطلوبة

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

عند رفع الملفات (الإيصال):
```http
Content-Type: multipart/form-data
```

### شكل الـ Pagination الموحّد

```json
{
  "count": 50,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

---

## 2. أدوار المستخدمين

| Role | الوصف |
|------|--------|
| `customer` | الزبون — الافتراضي عند التسجيل |
| `branch_manager` | مدير فرع — يدير طلبات فرعه فقط |
| `delivery` | موظف توصيل — يدير الطلبات المسندة له |
| `admin` | مشرف عام — كل شيء عبر `/admin/` |

> الأدوار تُعيَّن من لوحة الإدارة `http://localhost:8000/admin/` ولا يمكن تغييرها من الواجهة.

---

## 3. المصادقة (Authentication)

تسجيل الدخول يتم عبر رقم الموبايل + رمز OTP (يُرسل على واتساب).

### 3.1 طلب رمز التحقق

```
POST /api/auth/request-code/
```

**Body:**
```json
{ "phone": "0912345678" }
```

**الأرقام تُنرمل تلقائياً لصيغة E.164:** `+963912345678`

**Response 200:**
```json
{ "detail": "تم إرسال رمز التحقق على واتساب." }
```

**Response 503 (فشل خدمة OTP):**
```json
{ "detail": "فشل إرسال رمز التحقق، يرجى المحاولة لاحقاً." }
```

---

### 3.2 التحقق من الرمز

```
POST /api/auth/verify-code/
```

**Body:**
```json
{
  "phone": "0912345678",
  "code": "12345"
}
```

> **الكود مكوّن من 5 أرقام** (مش 6).

**Response 200:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOi...",
  "is_new": true
}
```

> `is_new: true` يعني المستخدم سُجّل لأول مرة — وجّهه لشاشة إكمال البيانات (الاسم + العنوان).

**Response 400 (رمز خاطئ):**
```json
{ "detail": "رمز التحقق غير صحيح أو انتهت صلاحيته." }
```

---

### 3.3 تجديد الـ Access Token

```
POST /api/auth/token/refresh/
```

**Body:**
```json
{ "refresh": "<refresh_token>" }
```

**Response 200:**
```json
{ "access": "<new_access_token>" }
```

---

### 3.4 الملف الشخصي

```
GET   /api/auth/me/   (يتطلب JWT)
PATCH /api/auth/me/   (يتطلب JWT)
```

**Response (GET):**
```json
{
  "id": 1,
  "phone": "+963912345678",
  "first_name": "محمد",
  "last_name": "علي",
  "address": "دمشق - المزة"
}
```

**Body (PATCH) — كل الحقول اختيارية:**
```json
{
  "first_name": "محمد",
  "last_name": "علي",
  "address": "دمشق - المزة - شارع 5"
}
```

> `phone` و `id` للقراءة فقط ولا يمكن تعديلهما.

---

## 4. التصنيفات (Categories) — Public

```
GET /api/products/categories/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "TVs",
    "name_ar": "تلفزيونات",
    "slug": "tvs",
    "icon": "/media/categories/tv.png"
  }
]
```

---

## 5. المنتجات (Products) — Public

### 5.1 قائمة المنتجات

```
GET /api/products/
GET /api/products/?category=<slug>     # فلترة بالتصنيف
GET /api/products/?search=<keyword>    # بحث بالاسم العربي/الإنجليزي
GET /api/products/?page=2              # تصفح
```

**Response (item):**
```json
{
  "id": 5,
  "name": "Samsung 55 Inch",
  "name_ar": "سامسونغ 55 بوصة",
  "slug": "samsung-55-inch",
  "price": "1500000.00",
  "category": {
    "id": 1,
    "name": "TVs",
    "name_ar": "تلفزيونات",
    "slug": "tvs",
    "icon": "/media/categories/tv.png"
  },
  "main_image": "http://localhost:8000/media/products/samsung-55.jpg"
}
```

> `main_image` تأتي كـ **absolute URL** جاهز.

---

### 5.2 تفاصيل المنتج

```
GET /api/products/<slug>/
```

**Response:**
```json
{
  "id": 5,
  "name": "Samsung 55 Inch",
  "name_ar": "سامسونغ 55 بوصة",
  "slug": "samsung-55-inch",
  "description": "Smart TV with 4K resolution",
  "description_ar": "تلفزيون ذكي بدقة 4K",
  "price": "1500000.00",
  "category": { "id": 1, "name": "TVs", "name_ar": "تلفزيونات", "slug": "tvs", "icon": "..." },
  "images": [
    { "id": 10, "image": "/media/products/samsung-55-1.jpg", "is_main": true },
    { "id": 11, "image": "/media/products/samsung-55-2.jpg", "is_main": false }
  ],
  "specs": [
    { "id": 1, "key": "Brand", "key_ar": "الماركة", "value": "Samsung", "value_ar": "سامسونغ" },
    { "id": 2, "key": "Screen Size", "key_ar": "حجم الشاشة", "value": "55 inch", "value_ar": "55 بوصة" }
  ],
  "is_available": true
}
```

> الصور هنا **مسارات نسبية** — أضف الـ Base URL يدوياً، أو استخدم Axios باعتر `baseURL` تلقائياً للصور.

**Response 404:**
```json
{ "detail": "المنتج غير موجود." }
```

---

## 6. الفروع (Branches) — Public

```
GET /api/branches/
GET /api/branches/<id>/
```

**Response:**
```json
{
  "id": 1,
  "name": "فرع المزة",
  "city": "دمشق",
  "address": "المزة - شارع الجلاء",
  "phone": "+963112345678",
  "is_active": true
}
```

---

## 7. الطلبات (Orders) — يتطلب JWT

### 7.1 قائمة طلبات الزبون

```
GET /api/orders/   (role: customer)
```

**Response (item):**
```json
{
  "id": 12,
  "status": "pending",
  "status_display": "Pending",
  "total_price": "300000.00",
  "deposit_amount": "30000.00",
  "branch_name": "فرع المزة",
  "item_count": 3,
  "delivery_address": "دمشق - المزة",
  "created_at": "2026-05-07T10:30:00Z"
}
```

---

### 7.2 إنشاء طلب جديد

```
POST /api/orders/   (role: customer)
```

**Body:**
```json
{
  "branch_id": 1,
  "items": [
    { "product_id": 5, "quantity": 2 },
    { "product_id": 8, "quantity": 1 }
  ],
  "deposit_amount": "50000.00",
  "delivery_address": "دمشق - المزة - شارع 5",
  "customer_note": "اتصل قبل التوصيل"
}
```

> **`total_price` و `deposit_percent` يُحسبان على السيرفر** — لا ترسلهما.
> **الإيصال يُرفع منفصلاً** بعد إنشاء الطلب (انظر القسم 7.4).

**Response 201:** يُرجع تفاصيل الطلب الكاملة (انظر 7.3).

**Response 400 (منتج غير متوفر):**
```json
{ "non_field_errors": ["أحد المنتجات غير متوفر."] }
```

---

### 7.3 تفاصيل طلب

```
GET /api/orders/<id>/   (role: customer — طلباته فقط)
```

**Response:**
```json
{
  "id": 12,
  "status": "preparing",
  "status_display": "Preparing",
  "branch_name": "فرع المزة",
  "total_price": "300000.00",
  "deposit_percent": "10.00",
  "deposit_amount": "30000.00",
  "delivery_address": "دمشق - المزة",
  "customer_note": "اتصل قبل التوصيل",
  "rejection_reason": "",
  "estimated_delivery": "2026-05-10T14:00:00Z",
  "receipt_image": "http://localhost:8000/media/receipts/12.jpg",
  "delivery_staff_name": "أحمد المحمد",
  "items": [
    {
      "id": 25,
      "product_id": 5,
      "product_name": "سامسونغ 55 بوصة",
      "unit_price": "1500000.00",
      "quantity": 2,
      "subtotal": "3000000.00"
    }
  ],
  "logs": [
    {
      "id": 1,
      "old_status": "",
      "new_status": "pending",
      "changed_by_name": null,
      "note": "",
      "changed_at": "2026-05-07T10:30:00Z"
    },
    {
      "id": 2,
      "old_status": "pending",
      "new_status": "confirmed",
      "changed_by_name": "مدير الفرع",
      "note": "تم التأكيد",
      "changed_at": "2026-05-07T11:00:00Z"
    }
  ],
  "created_at": "2026-05-07T10:30:00Z",
  "updated_at": "2026-05-07T11:00:00Z"
}
```

---

### 7.4 رفع إيصال الدفع

```
POST /api/orders/<id>/upload-receipt/   (role: customer)
Content-Type: multipart/form-data
```

**FormData:**
- `receipt`: ملف صورة (jpg/png)

**شروط:**
- الطلب لازم يكون بحالة `pending` فقط.
- المالك = المستخدم الحالي.

**Response 200:** تفاصيل الطلب المحدّث.

**Response 400:**
```json
{ "detail": "لا يمكن رفع الإيصال إلا للطلبات المعلقة." }
```

---

### 7.5 طلبات مدير الفرع

```
GET /api/orders/branch/   (role: branch_manager)
```

> يُرجع طلبات فرع المدير فقط (المعرّف عبر `user.branch`). إذا لم يكن للمدير فرع → 403.

---

### 7.6 طلبات موظف التوصيل

```
GET /api/orders/delivery/   (role: delivery)
```

> يُرجع الطلبات المسندة للموظف الحالي (`delivery_staff = user`).

---

### 7.7 تحديث حالة الطلب

```
PATCH /api/orders/<id>/status/   (role: branch_manager OR delivery)
```

**Body:**
```json
{
  "status": "confirmed",
  "delivery_staff_id": 3,
  "rejection_reason": "",
  "estimated_delivery": "2026-05-10T14:00:00Z",
  "note": "تم التأكيد بعد مراجعة الإيصال"
}
```

**كل الحقول اختيارية ما عدا `status`.**

| الحقل | متى نستخدمه |
|------|-------------|
| `delivery_staff_id` | فقط مدير الفرع — لإسناد موظف توصيل |
| `rejection_reason` | عند `cancelled` |
| `estimated_delivery` | عند `shipping` |
| `note` | ملاحظة تظهر في الـ logs |

**Response 200:** تفاصيل الطلب المحدّث.

**Response 400 (انتقال غير مسموح):**
```json
{ "detail": "لا يمكن الانتقال من 'shipping' إلى 'pending'." }
```

---

## 8. سير حالات الطلب

```
pending → confirmed → preparing → shipping → delivered
   ↓          ↓           ↓
cancelled  cancelled   cancelled
```

### الانتقالات المسموحة لكل دور

| الحالة الحالية | branch_manager | delivery |
|---------------|----------------|----------|
| `pending` | → `confirmed` / `cancelled` | — |
| `confirmed` | → `preparing` / `cancelled` | → `shipping` |
| `preparing` | → `cancelled` | → `shipping` |
| `shipping` | — | → `delivered` |
| `delivered` | — | — |
| `cancelled` | — | — |

> **مهم:** عند الانتقال إلى `shipping` تُرسل رسالة واتساب أوتوماتيكية للزبون.

---

## 9. أمثلة استخدام (Axios)

### إعداد Axios

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// تجديد التوكن عند 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const { data } = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          { refresh }
        );
        localStorage.setItem('access_token', data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(err.config);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
```

### تسجيل الدخول

```js
// 1. طلب الرمز
await api.post('/api/auth/request-code/', { phone: '0912345678' });

// 2. التحقق
const { data } = await api.post('/api/auth/verify-code/', {
  phone: '0912345678',
  code: '12345',
});
localStorage.setItem('access_token', data.access);
localStorage.setItem('refresh_token', data.refresh);

if (data.is_new) {
  // وجّه لشاشة إكمال البيانات
}
```

### إنشاء طلب + رفع الإيصال

```js
// 1. أنشئ الطلب
const { data: order } = await api.post('/api/orders/', {
  branch_id: 1,
  items: [{ product_id: 5, quantity: 2 }],
  deposit_amount: '50000.00',
  delivery_address: 'دمشق - المزة',
});

// 2. ارفع الإيصال
const formData = new FormData();
formData.append('receipt', fileInput.files[0]);

await api.post(`/api/orders/${order.id}/upload-receipt/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

### جلب المنتجات مع فلترة

```js
const { data } = await api.get('/api/products/', {
  params: { category: 'tvs', search: 'samsung', page: 1 },
});
// data.results, data.count, data.next, data.previous
```

---

## 10. رموز الاستجابة (Status Codes)

| Code | المعنى |
|------|--------|
| `200` | نجاح |
| `201` | تم الإنشاء |
| `400` | بيانات غير صحيحة |
| `401` | غير مصادق — التوكن مفقود/منتهي |
| `403` | ممنوع — الدور لا يملك صلاحية |
| `404` | غير موجود |
| `503` | خدمة خارجية معطلة (OTP/WhatsApp) |

---

## 11. ملاحظات مهمة

1. **الأسعار**: تأتي كـ `string` (`"1500000.00"`) لتجنب فقدان الدقة في JavaScript. استخدم `parseFloat` أو مكتبة `decimal.js` عند الحاجة.

2. **الصور**:
   - `main_image` في قائمة المنتجات → **absolute URL** جاهز.
   - الصور داخل تفاصيل المنتج (`images[].image`) → **مسار نسبي** يحتاج إضافة Base URL.
   - `receipt_image` في تفاصيل الطلب → **absolute URL**.

3. **التواريخ**: بصيغة ISO 8601 UTC (`2026-05-07T10:30:00Z`). حوّلها لتوقيت المستخدم محلياً.

4. **التحقق من الموبايل**: إلزامي قبل أي عملية تتطلب JWT (إنشاء طلب، تحديث حالة، إلخ).

5. **Pagination**: مفعّل افتراضياً على كل القوائم — استخدم `?page=N`.

6. **CORS**: مفعّل للبورت `5173` فقط. لو عند بورت ثاني أبلغ الـ Backend ليضيفه في `config/settings.py`.

7. **Postman Collection**: متاحة في [albasheer_postman_collection.json](albasheer_postman_collection.json) للاستيراد المباشر.

---

## 12. الـ Endpoints المختصرة

| Method | Endpoint | الدور |
|--------|----------|------|
| POST | `/api/auth/request-code/` | عام |
| POST | `/api/auth/verify-code/` | عام |
| POST | `/api/auth/token/refresh/` | عام |
| GET | `/api/auth/me/` | مصادق |
| PATCH | `/api/auth/me/` | مصادق |
| GET | `/api/products/categories/` | عام |
| GET | `/api/products/` | عام |
| GET | `/api/products/<slug>/` | عام |
| GET | `/api/branches/` | عام |
| GET | `/api/branches/<id>/` | عام |
| GET | `/api/orders/` | customer |
| POST | `/api/orders/` | customer |
| GET | `/api/orders/<id>/` | customer |
| POST | `/api/orders/<id>/upload-receipt/` | customer |
| GET | `/api/orders/branch/` | branch_manager |
| GET | `/api/orders/delivery/` | delivery |
| PATCH | `/api/orders/<id>/status/` | branch_manager / delivery |

---

## للتواصل

أي سؤال أو endpoint ناقص — راجع فريق الـ Backend.
