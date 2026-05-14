# دليل النشر — البشير Frontend

نشر الفرونت كـ Docker container يخدم الـ SPA عبر nginx.

| العنصر | القيمة |
|------|------|
| السيرفر | `161.97.156.42` |
| البورت العام | `3012` |
| الـ Backend (متوقع) | `http://161.97.156.42:8000` |
| الـ Image | `albasheer-frontend:latest` |
| Container name | `albasheer-frontend` |

> الفرونت Static SPA (Vite + React) — يتنّبني مرة كـ static files ويُخدم بواسطة nginx. لا server-side rendering.

---

## 1. ما يلزم على السيرفر

```bash
# لو ما عندك Docker بعد:
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# سجّل خروج ودخول من جديد ليفعّل صلاحيات المجموعة

# تأكد من Docker و Docker Compose:
docker --version
docker compose version
```

افتح بورت 3012 على الـ firewall:

```bash
# لو UFW:
sudo ufw allow 3012/tcp

# لو firewalld:
sudo firewall-cmd --add-port=3012/tcp --permanent
sudo firewall-cmd --reload
```

---

## 2. ضبط الإعدادات (env)

انسخ ملف العيّنة:

```bash
cp .env.production.example .env
```

عدّل `.env` لو الباك على عنوان مختلف:

```env
VITE_API_BASE_URL=http://161.97.156.42:8000
VITE_MEDIA_BASE_URL=http://161.97.156.42:8000
VITE_DEFAULT_LANG=ar
```

> ⚠️ **هاي القيم تنبني داخل الـ bundle (build-time)** — أي تعديل عليهن يحتاج إعادة build.
> أي قيمة بتروح للمتصفح، فلا تحط أسرار هنا (لا توكنات، لا API keys).

---

## 3. النشر

من نفس مجلد المشروع على السيرفر:

```bash
# بناء الـ image وتشغيله
docker compose up -d --build

# تأكد إنه شغال
docker compose ps

# شوف الـ logs لو في مشكلة
docker compose logs -f frontend
```

افتح المتصفح:

```
http://161.97.156.42:3012/
```

---

## 4. التحديث (نشر نسخة جديدة)

```bash
git pull
docker compose up -d --build
```

الـ container القديم بينحذف تلقائياً والجديد بياخد محله. الـ downtime ≈ 1-2 ثانية.

---

## 5. CORS — مهم جداً

الباك حالياً يسمح فقط بـ `http://localhost:5173` و `http://127.0.0.1:5173`.
**لازم تضيفي origin السيرفر** للسماح بالـ requests من الفرونت بعد النشر.

في `config/settings.py` على الباك:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://161.97.156.42:3012",   # ← أضف هذا
]
```

ثم أعد تشغيل الباك. بدون هاد، كل الـ API calls رح تفشل بـ CORS error.

---

## 6. أوامر مفيدة

```bash
# إيقاف
docker compose down

# إعادة تشغيل بدون rebuild
docker compose restart frontend

# دخول للـ container للفحص
docker exec -it albasheer-frontend sh

# عرض الـ resource usage
docker stats albasheer-frontend

# مسح كل شي وبداية نظيفة
docker compose down --rmi all -v
docker compose up -d --build
```

---

## 7. تحقق من الصحة

```bash
# من السيرفر نفسه:
curl -I http://localhost:3012/
# لازم يرجع 200 OK

# من خارج:
curl -I http://161.97.156.42:3012/
```

تأكدي إنه:
- الصفحة الرئيسية تفتح
- الـ refresh على أي route عميق (مثلاً `/products/<slug>`) ما يرجع 404 — لأن nginx يعمل SPA fallback
- الفرونت يتصل بالباك (افتحي DevTools → Network)

---

## 8. ملاحظات للمستقبل

- **HTTPS:** لو بدك تنشري بـ HTTPS، الأفضل تحطي Caddy أو Traefik كـ reverse proxy فوق هاد الـ container ويكفلولك الـ TLS تلقائياً.
- **Backend reverse-proxy:** بدل ما الفرونت يخاطب الباك مباشرة على `:8000`، فيك تخلي nginx يـ proxy الـ `/api/` و `/media/` على الباك. هاد بيلغي مشكلة الـ CORS كلياً. لو حابة هالخيار، خبرينا.
- **CDN:** الـ assets جاهزة للـ caching (1 سنة). تقدري تربطي Cloudflare أمام السيرفر بسهولة.
- **Multi-arch:** الـ Dockerfile متوافق مع amd64 و arm64. لو السيرفر ARM، نفس الأمر.

---

## 9. استكشاف الأخطاء

### الفرونت يفتح بس ما يتصل بالباك
- افتحي DevTools → Network → لو CORS error: راجعي القسم 5
- لو 404 على `/api/...`: تأكدي إن `VITE_API_BASE_URL` صح وأعيدي build

### الـ build فاشل
- شيكي logs: `docker compose logs frontend`
- لو out of memory: زيدي memory للـ Docker (Docker Desktop → Settings → Resources)

### الصفحة بتفتح بس refresh على route عميق يرجع 404
- nginx config مش متطبق. تأكدي إن `nginx.conf` موجود وانعمل copy في الـ Dockerfile

### CORS errors بعد إضافة الـ origin
- تأكدي من إعادة تشغيل الباك
- تأكدي من البروتوكول (`http://` مش `https://`) — لازم يطابق
