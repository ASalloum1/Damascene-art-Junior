# Backend Requirements — Email Replies, Reviews & SM Avatar

> **مشروع:** Damascene Art Platform
> **الـ stack:** Laravel + MySQL (REST API) — يستهلكه ثلاث واجهات React (Vite): `Admin-panel`, `store-manager-dashboard`, `customer-guest`.
> **الجمهور:** Backend team.
> **الإصدار:** Sprint multi-panel-fixes — ٢٠٢٦/٠٥

## الهدف

هذا المستند يحدّد كل ما يلزمه فريق الباك حتى تعمل الواجهات الجديدة في الـ Admin Panel و Store-Manager و Customer-Guest بشكل كامل، ويغطّي:

1. إعداد SMTP لإرسال إيميلات الردود.
2. Mailable class واحد + Blade template للرد على التقييمات.
3. أربعة Endpoints جديدة (Admin reply / SM reply / Customer review submit / SM avatar upload).
4. شرط أمني صارم لجميع تقارير الـ Store-Manager (filter by `store_id` derived from auth).
5. Database migration واحدة لإضافة `users.avatar_path`.
6. جدول ربط Frontend ↔ Backend لكل endpoint جديد.
7. أسئلة مفتوحة بحاجة قرار قبل التنفيذ.

> **قاعدة جوهرية:** ردود الـ Admin/SM على التقييمات **لا تُحفظ في قاعدة البيانات**. مجلّد *Sent* في حساب `info.damasceneart@gmail.com` هو المرجع الوحيد (audit trail).

---

## 1. SMTP Configuration

أضف الكتلة التالية إلى ملف `.env` الخاص بالـ Laravel backend:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=info.damasceneart@gmail.com
MAIL_PASSWORD=<app-password>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=info.damasceneart@gmail.com
MAIL_FROM_NAME="الفن الدمشقي"
```

**ملاحظات حرجة:**

- `MAIL_PASSWORD` هو **Gmail App Password** وليس كلمة مرور الحساب. يتم توليده من إعدادات حساب Google (Two-Step Verification → App passwords). لا تستخدم كلمة المرور العادية للحساب — سترفض Google الاتصال.
- يجب توليد App Password منفصل لكل بيئة (`local`, `staging`, `production`) وحفظه في secret manager أو vault، **لا تضعه في الـ git**.
- بعد التعديل: شغّل `php artisan config:clear` لضمان التقاط القيم الجديدة.

---

## 2. Mailable Classes

### `App\Mail\ReviewReplyMail`

Mailable class مشترك بين Admin reply و SM reply (نفس القالب، نفس الترويسة).

**Constructor signature:**

```php
public function __construct(
    public string $subject,
    public string $message,
    public string $customerEmail,
    public string $productName,
) {}
```

**Build method (مختصر):**

```php
public function build()
{
    return $this->to($this->customerEmail)
        ->subject($this->subject)
        ->view('emails.review-reply')
        ->with([
            'body'        => $this->message,
            'productName' => $this->productName,
        ]);
}
```

### Blade template: `resources/views/emails/review-reply.blade.php`

- `<html dir="rtl" lang="ar">`
- استورد خط Tajawal من Google Fonts داخل `<style>` (inline لأن client mail لا يدعم external CSS reliably).
- ترويسة بسيطة: شعار "الفن الدمشقي" + اسم المنتج.
- جسم الرسالة: محتوى `$body` كنص عادي (مع حفاظ على line breaks: `nl2br(e($body))`).
- تذييل: "مع تحيات فريق الفن الدمشقي — info.damasceneart@gmail.com".

---

## 3. Endpoints

### 3.1 `POST /api/admin/reviews/{reviewId}/reply`

| Field | Value |
|---|---|
| **Auth guard** | `auth:sanctum` + `role:admin` |
| **Method** | POST |
| **Path** | `/api/admin/reviews/{reviewId}/reply` |
| **Source** | `frontend/Admin-panel/src/pages/admin/ReviewsManagement.jsx` |

**Request body:**

```json
{
  "subject": "رد من الفن الدمشقي على تقييمك للمنتج: زهرية دمشقية",
  "message": "نشكرك على تقييمك. سنأخذ ملاحظاتك بعين الاعتبار..."
}
```

**Validation:**

- `subject`: `required|string|min:3|max:200`
- `message`: `required|string|min:10|max:5000`

**Side effects:**

1. Lookup `rate_feedback_products.id = {reviewId}` → جلب `customer.email` و `product.name`.
2. أرسل `ReviewReplyMail` عبر `Mail::send(...)`.
3. لا حفظ في DB. (لا جدول replies.)

**Response (success):**

```json
{
  "success": true,
  "message": "تم إرسال الرد بنجاح"
}
```

**Error cases:**

| Status | Cause | Body |
|---|---|---|
| 401 | Token مفقود/منتهي | `{ "message": "Unauthenticated." }` |
| 403 | المستخدم ليس admin | `{ "message": "Forbidden" }` |
| 404 | reviewId غير موجود | `{ "message": "Review not found" }` |
| 422 | فشل validation | `{ "message": "...", "errors": { ... } }` |
| 500 | فشل SMTP | `{ "success": false, "message": "تعذّر الإرسال" }` |

**curl example:**

```bash
curl -X POST https://api.damascene-art.com/api/admin/reviews/42/reply \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"subject":"رد من الفن الدمشقي","message":"نشكرك على تقييمك..."}'
```

---

### 3.2 `POST /api/store-manager/reviews/{reviewId}/reply`

| Field | Value |
|---|---|
| **Auth guard** | `auth:sanctum` + `role:store-manager` |
| **Method** | POST |
| **Path** | `/api/store-manager/reviews/{reviewId}/reply` |
| **Source** | `frontend/store-manager-dashboard/src/pages/ReviewsPage.jsx` |

**Request body:** نفس بنية §3.1.

**Validation:** نفس قواعد §3.1.

**Side effects (يختلف عن Admin):**

1. Lookup `rate_feedback_products.id = {reviewId}` مع علاقة `product`.
2. **تحقّق ملكيّة المتجر:**

   ```php
   abort_if(
       $review->product->store_id !== auth()->user()->store_id,
       403,
       'هذا التقييم لا يخص متجرك'
   );
   ```

3. إرسال نفس `ReviewReplyMail`.
4. لا حفظ في DB.

**Response:** نفس بنية §3.1.

**Error cases إضافية:**

| Status | Cause |
|---|---|
| 403 | `review.product.store_id !== auth()->user()->store_id` (IDOR prevention) |

**curl example:**

```bash
curl -X POST https://api.damascene-art.com/api/store-manager/reviews/42/reply \
  -H "Authorization: Bearer <sm-token>" \
  -H "Content-Type: application/json" \
  -d '{"subject":"شكراً لتقييمك","message":"نقدّر ملاحظاتك..."}'
```

---

### 3.3 `POST /api/customers/products/{productId}/reviews`

| Field | Value |
|---|---|
| **Auth guard** | `auth:sanctum` + `role:customer` |
| **Method** | POST |
| **Path** | `/api/customers/products/{productId}/reviews` |
| **Source** | `frontend/customer-guest/src/pages/ProductPage.jsx` |

**Request body:**

```json
{
  "rate": 5,
  "feedback": "تحفة فنية حقيقية، التفاصيل مذهلة."
}
```

**Validation:**

- `rate`: `required|integer|min:1|max:5`
- `feedback`: `required|string|min:10|max:500`
- `productId` (route): `required|exists:products,id`

**Side effects:**

1. أدخل سجل في `rate_feedback_products`:

   ```php
   RateFeedbackProduct::create([
       'product_id'  => $productId,
       'customer_id' => auth()->id(),
       'rate'        => $request->rate,
       'feedback'    => $request->feedback,
       'status'      => 'pending', // ← لا ينشر تلقائياً
   ]);
   ```

2. لا إرسال إيميل. الـ moderation queue يخص Admin/SM.

**Response (success — 201):**

```json
{
  "success": true,
  "review_id": 128,
  "message": "شكراً لك! سيتم نشر تقييمك بعد المراجعة"
}
```

**Error cases:**

| Status | Cause |
|---|---|
| 401 | Token مفقود/منتهي (الواجهة تعرض "انتهت صلاحية الجلسة") |
| 404 | `productId` غير موجود (الواجهة تعرض "هذه الميزة قيد التفعيل") |
| 422 | فشل validation |

**curl example:**

```bash
curl -X POST https://api.damascene-art.com/api/customers/products/15/reviews \
  -H "Authorization: Bearer <customer-token>" \
  -H "Content-Type: application/json" \
  -d '{"rate":5,"feedback":"تحفة فنية حقيقية، التفاصيل مذهلة."}'
```

> **سؤال مفتوح:** هل نسمح للعميل الواحد بأكثر من تقييم على نفس المنتج؟ راجع §7.

---

### 3.4 `POST /api/store-manager/profile/avatar`

| Field | Value |
|---|---|
| **Auth guard** | `auth:sanctum` + `role:store-manager` |
| **Method** | POST |
| **Content-Type** | `multipart/form-data` |
| **Path** | `/api/store-manager/profile/avatar` |
| **Source** | `frontend/store-manager-dashboard/src/pages/ProfilePage.jsx` |

**Request body (multipart):**

| Field | Type | Constraints |
|---|---|---|
| `image` | File | `image \| mimes:png,jpg,jpeg \| max:2048` (≤ 2 MB) |

**Side effects:**

1. خزّن الملف تحت `storage/avatars/{userId}-{timestamp}.{ext}` (لا تكتب فوق القديم — احتفظ بنسخة لـ rollback).
2. حدّث `users.avatar_path` بالمسار النسبي.
3. (اختياري) احذف الـ avatar السابق بعد commit ناجح.

**Response (success):**

```json
{
  "success": true,
  "avatar_url": "https://api.damascene-art.com/storage/avatars/12-1715000000.png"
}
```

**Error cases:**

| Status | Cause |
|---|---|
| 401 | Token مفقود/منتهي |
| 422 | الملف ليس صورة، أو > 2 MB، أو امتداد غير مسموح |
| 500 | فشل storage write |

**curl example:**

```bash
curl -X POST https://api.damascene-art.com/api/store-manager/profile/avatar \
  -H "Authorization: Bearer <sm-token>" \
  -F "image=@/path/to/avatar.png"
```

---

## 4. Reports Filtering Security

> **قاعدة صارمة:** كل endpoints التقارير في Store-Manager panel يجب أن تستخرج `store_id` تلقائياً من `auth()->user()->store_id`. **لا تثق أبداً بـ `store_id` query parameter من الـ frontend.** هذا يمنع IDOR (Insecure Direct Object Reference).

```php
// مثال على النمط الصحيح:
$storeId = auth()->user()->store_id;
$kpis = Report::query()
    ->where('store_id', $storeId) // ← من الـ token، ليس من الـ request
    ->whereBetween('created_at', [$from, $to])
    ->get();
```

### Endpoints المتأثرة (من خطة Team 3 لصفحة `ReportsPage.jsx`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/store-manager/me` | يعيد بيانات المتجر + المدير الحالي |
| GET | `/api/store-manager/reports/kpis?from&to` | الـ KPIs الأربعة (إيرادات، طلبات، عملاء، متوسط) |
| GET | `/api/store-manager/reports/sales-trend?from&to&granularity=month` | بيانات رسم خطي (line chart) |
| GET | `/api/store-manager/reports/sales-by-category?from&to` | breakdown حسب الفئة |
| GET | `/api/store-manager/reports/geographic?from&to` | توزّع جغرافي للطلبات |
| GET | `/api/store-manager/reports/customer-acquisition?from&to` | عملاء جدد عبر الزمن |
| GET | `/api/store-manager/reports/products?from&to` | أداء المنتجات |
| GET | `/api/store-manager/reports/customers?from&to` | جدول العملاء |
| GET | `/api/store-manager/reports/orders?from&to` | جدول الطلبات |

**جميع هذه الـ endpoints مفلترة على `auth()->user()->store_id` — لا يوجد parameter `store_id` في الـ query.**

---

## 5. Database Migrations

### 5.1 إضافة `users.avatar_path`

```sql
ALTER TABLE users ADD COLUMN avatar_path VARCHAR(255) NULL;
```

**Laravel migration snippet:**

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('avatar_path', 255)->nullable()->after('email');
});
```

### 5.2 جداول الردود

> **لا يوجد جدول جديد للردود.** Sent folder في حساب `info.damasceneart@gmail.com` هو السجل الوحيد. هذا قرار مقصود لتقليل الـ surface ولأن الردود طبيعتها transactional لا transactional-recordable.

---

## 6. Frontend ↔ Backend Contract Checklist

| Endpoint | Frontend file | Status |
|---|---|---|
| `POST /api/customers/products/{productId}/reviews` | `frontend/customer-guest/src/pages/ProductPage.jsx` | ⏳ Backend pending |
| `POST /api/admin/reviews/{reviewId}/reply` | `frontend/Admin-panel/src/pages/admin/ReviewsManagement.jsx` | ⏳ Backend pending |
| `POST /api/store-manager/reviews/{reviewId}/reply` | `frontend/store-manager-dashboard/src/pages/ReviewsPage.jsx` | ⏳ Backend pending |
| `POST /api/store-manager/profile/avatar` | `frontend/store-manager-dashboard/src/pages/ProfilePage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/me` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/kpis` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/sales-trend` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/sales-by-category` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/geographic` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/customer-acquisition` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/products` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/customers` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |
| `GET /api/store-manager/reports/orders` | `frontend/store-manager-dashboard/src/pages/ReportsPage.jsx` | ⏳ Backend pending |

> الواجهة تتعامل مع 404/5xx برسائل عربية مهذّبة (مثل "هذه الميزة قيد التفعيل، حاول لاحقاً")، فيمكن دفع الواجهة قبل اكتمال الباك دون كسر تجربة المستخدم.

---

## 7. Open Questions

1. **Gmail App Password storage.** أين يُخزّن الـ App Password؟ Hashicorp Vault؟ AWS Secrets Manager؟ أم `.env` + restrictive IAM فقط؟ يجب الاتفاق قبل النشر.
2. **Rate limiting على endpoints الرد.** يجب وضع throttle (مثلاً `throttle:30,1` لكل user) على `/api/admin/reviews/*/reply` و `/api/store-manager/reviews/*/reply` لمنع spam على إيميلات العملاء.
3. **One-review-per-customer-per-product?** هل نسمح للعميل بإرسال أكثر من تقييم لنفس المنتج (تحديث/إضافة)؟ أم نرفض الثاني بـ 409 Conflict؟ القرار يؤثّر على:
   - schema (هل نضيف unique index على `(product_id, customer_id)` في `rate_feedback_products`؟)
   - الـ UX في `ProductPage.jsx` و `MyReviewsPage.jsx` (زر "تعديل" حالياً TODO).
4. **Email template versioning.** إذا تغيّرت ترويسة `review-reply.blade.php` لاحقاً، هل نريد نسخة مؤرّخة أم تحديث في المكان؟
5. **Avatar cleanup policy.** هل نحذف الـ avatars القديمة فوراً بعد رفع جديد، أم نتركها لـ scheduled job ينظّفها بعد ٣٠ يوماً؟
