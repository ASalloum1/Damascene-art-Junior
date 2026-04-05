# 🛡️ Damascene Art — Admin Panel Full Specification
## For Claude Code / React Implementation

---

## 📋 PROJECT OVERVIEW

**Project:** Damascene Art E-Commerce Platform — Admin Panel
**Users:** 3 types (Admin, Store Manager, Customer/Guest) — This doc covers **Admin only**
**Tech Stack:** React + React Router + Tailwind CSS (or CSS Modules)
**Direction:** RTL (Arabic-first, English support)
**Font:** Tajawal (Google Fonts) — Arabic/Latin support
**Total Pages:** 13 pages

---

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary Gold:      #C8A45A  (buttons, accents, active states)
Gold Light:        #E8D5A3  (hover states, secondary accents)
Gold Dark:         #A07830  (pressed states)
Navy:              #1A1F3A  (sidebar, headers, primary text)
Navy Light:        #252B4A  (sidebar hover, cards)
Navy Mid:          #2D3460  (active sidebar item bg)
Cream:             #FFF8F0  (main background)
Cream Dark:        #F5EDE0  (card backgrounds, borders, table alt rows)
White:             #FFFFFF  (cards, inputs)
Red:               #C0392B  (errors, delete, danger, declined)
Green:             #27AE60  (success, active, approved)
Blue:              #2980B9  (info, links, edit actions)
Orange:            #E67E22  (warnings, pending states)
Text Primary:      #2C2C2C
Text Secondary:    #7A7A7A
```

### Typography
```
Font Family:       'Tajawal', sans-serif
Heading 1:         28px, weight 800
Heading 2:         20px, weight 700
Heading 3:         16px, weight 700
Body:              14px, weight 400
Small/Caption:     12px, weight 400
Tiny:              11px, weight 400
```

### Spacing & Radius
```
Card Border Radius:   14px
Button Border Radius: 8px
Badge Border Radius:  20px (pill shape)
Input Border Radius:  8px
Card Padding:         24px
Page Padding:         24px
Gap (cards/grid):     16-18px
```

### Shadows
```
Card Shadow:       0 2px 12px rgba(0,0,0,0.06)
Dropdown Shadow:   0 4px 20px rgba(0,0,0,0.12)
Modal Shadow:      0 8px 32px rgba(0,0,0,0.15)
```

---

## 🧩 SHARED / REUSABLE COMPONENTS

Build these first — every page uses them:

### 1. Layout Components
```
<AdminLayout>
├── <Sidebar />           — collapsible, RTL, gold/navy theme
│   ├── Logo section      — 🏺 + "الفن الدمشقي" + "لوحة المشرف العام"
│   ├── Toggle button     — collapse/expand
│   └── <NavItem />       — icon + label + active state + optional badge count
├── <TopBar />            — page title with icon, notification bell (with count badge), admin avatar + name
└── <MainContent />       — scrollable area with padding
```

### 2. Data Display Components
```
<StatCard />              — icon, label, value, color accent, subtitle tag
  Props: icon, label, value, color, subtitle

<DataTable />             — sortable, filterable, with pagination
  Props: headers[], rows[], onSort, onFilter, pagination, actions[]
  Features: checkbox selection, bulk actions, row click, empty state

<Badge />                 — colored pill for statuses
  Props: text, color (or variant: success/warning/danger/info/default)

<MiniBar />               — small horizontal progress bar
  Props: percentage, color

<Timeline />              — vertical timeline with steps
  Props: steps[{label, date, done, active}]

<EmptyState />            — illustration + message when no data
  Props: icon, title, description, actionLabel, onAction
```

### 3. Form Components
```
<InputField />            — label + input with RTL support
  Props: label, type, placeholder, value, onChange, error, required

<SelectField />           — label + dropdown
  Props: label, options[], value, onChange, placeholder

<TextArea />              — label + multiline input
  Props: label, placeholder, rows, value, onChange

<SearchInput />           — search icon + input with debounce
  Props: placeholder, onSearch, debounceMs

<DateRangePicker />       — from/to date selection
  Props: startDate, endDate, onChange

<FilterBar />             — horizontal bar with multiple filter dropdowns
  Props: filters[{label, options[], value, onChange}]
```

### 4. Action Components
```
<Button />                — primary, outline, danger, small variants
  Props: variant, size, icon, onClick, loading, disabled, fullWidth

<ActionMenu />            — three-dot menu with dropdown actions
  Props: actions[{label, icon, onClick, danger?}]

<ConfirmModal />          — "Are you sure?" dialog
  Props: title, message, onConfirm, onCancel, danger?

<Modal />                 — generic modal wrapper
  Props: isOpen, onClose, title, size(sm/md/lg), children

<Toast />                 — success/error notification popup
  Props: message, type(success/error/warning), duration
```

### 5. Chart Components
```
<BarChart />              — vertical bar chart (use Recharts library)
<LineChart />             — trend line chart
<PieChart />              — donut/pie chart
<AreaChart />             — filled area chart
```

---

## 📐 SIDEBAR NAVIGATION

```
Menu Items (in order):
─────────────────────────────────────────
📊  لوحة التحكم              /admin/dashboard
👥  إدارة المستخدمين          /admin/users
🏪  إدارة المتاجر             /admin/stores
🏺  إدارة المنتجات            /admin/products
🛒  إدارة الطلبات             /admin/orders
💰  الإدارة المالية            /admin/finance
📈  التقارير والتحليلات        /admin/analytics
📋  سجل النشاطات             /admin/activity-log
💬  الرسائل والطلبات          /admin/messages
🔔  إدارة الإشعارات           /admin/notifications
⭐  إدارة التقييمات           /admin/reviews
🌐  إعدادات الموقع            /admin/site-settings
👤  الملف الشخصي             /admin/profile
─────────────────────────────────────────
```

---

## 📄 PAGE-BY-PAGE SPECIFICATIONS

---

### PAGE 1: Admin Dashboard (لوحة التحكم)
**Route:** `/admin/dashboard`

#### Top Stats Row (4 cards)
```
Card 1: 💰 إجمالي الإيرادات    — value: "١٢٥,٤٣٠ $"  — subtitle: "هذا الشهر"   — color: green
Card 2: 🛒 إجمالي الطلبات      — value: "٤٨٦"         — subtitle: "هذا الشهر"   — color: blue
Card 3: 👥 إجمالي المستخدمين   — value: "١,٢٤٥"       — subtitle: "مسجلين"      — color: gold
Card 4: 🏪 المتاجر النشطة      — value: "٣"            — subtitle: "من أصل ٤"    — color: orange
```

#### Row 2: Two columns
```
Left (60%):  Revenue Chart — BarChart showing monthly revenue (12 months)
             Title: "📈 الإيرادات الشهرية"
             X-axis: months in Arabic (يناير، فبراير...)
             Y-axis: revenue in $

Right (40%): Top Selling Products — ranked list with MiniBar
             Title: "🏆 المنتجات الأكثر مبيعاً"
             Show: product name, sold count, progress bar
             Data: top 5 products across all stores
```

#### Row 3: Two columns
```
Left (50%):  Orders by Status — PieChart/DonutChart
             Title: "📦 الطلبات حسب الحالة"
             Segments: جديد، قيد التجهيز، تم الشحن، مكتمل، ملغي، مرتجع

Right (50%): Recent Activity — mini activity log
             Title: "🕐 آخر النشاطات"
             Show: last 5-7 activities with icon, description, user, time
             Link: "عرض الكل ←" → navigates to activity log page
```

#### Row 4: Full width
```
Recent Orders Table — last 5 orders across all stores
Title: "🛒 آخر الطلبات"
Columns: رقم الطلب | المتجر | العميل | المنتجات | المبلغ | الحالة | التاريخ
Link: "عرض كل الطلبات ←" → navigates to orders page
```

---

### PAGE 2: User Management (إدارة المستخدمين)
**Route:** `/admin/users`

#### Header
```
Title: "إدارة المستخدمين"
Action Button: "+ إضافة مستخدم جديد" → opens AddUserModal
```

#### Stats Row (4 cards)
```
Card 1: 👥 إجمالي المستخدمين  — "١,٢٤٥"  — color: blue
Card 2: 🛡️ مشرفين (Admin)     — "٢"       — color: red
Card 3: 🏪 مدراء متاجر        — "٤"       — color: gold
Card 4: 🛍️ عملاء              — "١,٢٣٩"  — color: green
```

#### Filter Bar
```
Filters:
- SearchInput: "🔍 بحث بالاسم أو البريد الإلكتروني..."
- Select: الدور (الكل / أدمن / مدير متجر / عميل)
- Select: الحالة (الكل / نشط / معطّل)
- DateRangePicker: تاريخ التسجيل
```

#### Users Table
```
Columns:
- المستخدم (avatar + name + email)
- الدور (Badge: أدمن=red, مدير متجر=gold, عميل=green)
- المتجر (store name or "—" for admin/customer)
- الحالة (Badge: نشط=green, معطّل=red)
- تاريخ التسجيل
- آخر نشاط (relative time: "منذ ٥ دقائق")
- إجراءات (ActionMenu: عرض، تعديل، إعادة تعيين كلمة المرور، تعطيل/تفعيل، حذف)

Features:
- Checkbox selection for bulk actions (bulk disable, bulk delete)
- Sortable columns
- Pagination (10/25/50 per page)
```

#### AddUserModal
```
Fields:
- الاسم الأول (text, required)
- اسم العائلة (text, required)
- البريد الإلكتروني (email, required, unique validation)
- كلمة المرور (password, required, min 8 chars)
- الدور (select: أدمن / مدير متجر / عميل)
- المتجر (select, conditional — only shows if role = مدير متجر)
- الحالة (toggle: نشط/معطّل, default: نشط)

Actions: إنشاء المستخدم | إلغاء
```

---

### PAGE 3: Stores Management (إدارة المتاجر)
**Route:** `/admin/stores`

#### Header
```
Title: "إدارة المتاجر"
Action Button: "+ إضافة متجر جديد" → opens AddStoreModal
```

#### Stores Grid (card-based layout, not table)
```
Each Store Card contains:
┌──────────────────────────────────────┐
│  🏪  [Store Name]         [Badge: نشط/معطّل]
│  المدير: [manager name]
│  ─────────────────────────────
│  📦 المنتجات: ١٥٤    🛒 الطلبات: ٨٦
│  💰 إيرادات الشهر: ٤٥,٢٣٠$
│  👥 الموظفين: ٥
│  ─────────────────────────────
│  [تعديل]  [عرض التقرير]  [تعطيل]
└──────────────────────────────────────┘

Grid: 2-3 columns responsive
```

#### Store Details View (expandable or separate page)
```
Sections:
1. معلومات المتجر — name, description, logo, contact info
2. المدير والموظفين — assigned manager, employee list
3. إحصائيات سريعة — products count, orders count, revenue, avg rating
4. آخر الطلبات — recent 5 orders of this store
```

#### AddStoreModal
```
Fields:
- اسم المتجر (text, required)
- وصف المتجر (textarea)
- مدير المتجر (select from existing managers or create new)
- البريد الإلكتروني (email)
- رقم الهاتف (text)
- العنوان (text)
- الحالة (toggle: نشط/معطّل)

Actions: إنشاء المتجر | إلغاء
```

---

### PAGE 4: Global Products Management (إدارة المنتجات)
**Route:** `/admin/products`

#### Header
```
Title: "إدارة المنتجات (شامل)"
Subtitle: "عرض كل المنتجات عبر جميع المتاجر"
```

#### Filter Bar
```
- SearchInput: "🔍 بحث عن منتج..."
- Select: المتجر (الكل / متجر ١ / متجر ٢...)
- Select: التصنيف (الكل / فسيفساء / خشب مطعّم / زجاج منفوخ / بروكار / نحاسيات / فخار)
- Select: الحالة (الكل / نشط / مخفي / نفد المخزون)
- Select: السعر (الكل / أقل من ١٠٠$ / ١٠٠-٥٠٠$ / ٥٠٠-١٠٠٠$ / أكثر من ١٠٠٠$)
```

#### Products Table
```
Columns:
- الصورة (thumbnail 40x40)
- اسم المنتج
- المتجر (which store owns this product)
- التصنيف (Badge with category color)
- السعر
- المخزون (number, colored red if < 5)
- التقييم (stars + count)
- الحالة (Badge: نشط/مخفي/نفد المخزون)
- إجراءات (ActionMenu: عرض، تعديل، إخفاء/إظهار، حذف)

Features:
- Sortable by name, price, stock, rating
- Checkbox selection for bulk actions
- Pagination
```

#### Categories Management (sub-section or tab)
```
Table of categories:
- اسم التصنيف
- الأيقونة
- عدد المنتجات
- الحالة
- إجراءات (تعديل، حذف)

Button: "+ إضافة تصنيف جديد"
```

---

### PAGE 5: Global Orders (إدارة الطلبات)
**Route:** `/admin/orders`

#### Header
```
Title: "إدارة الطلبات (شامل)"
```

#### Status Tabs (horizontal pills)
```
الكل (486) | جديد (٢٨) | قيد التجهيز (١٥) | تم الشحن (٣٢) | مكتمل (٣٨٠) | ملغي (١٨) | مرتجع (١٣)
Active tab: filled navy bg with gold text
Inactive: white bg with border
```

#### Filter Bar
```
- SearchInput: "🔍 بحث برقم الطلب أو اسم العميل..."
- Select: المتجر (الكل / متجر ١ / متجر ٢...)
- Select: طريقة الدفع (الكل / بطاقة ائتمان / PayPal / تحويل بنكي)
- DateRangePicker: فترة الطلب
```

#### Orders Table
```
Columns:
- رقم الطلب (#1084 format)
- المتجر
- العميل (name + email)
- المنتجات (count: "٣ منتجات")
- المبلغ
- طريقة الدفع
- الحالة (Badge with appropriate color)
- تاريخ الطلب
- إجراءات (ActionMenu: عرض التفاصيل، تحديث الحالة، إلغاء، استرداد)

Features:
- Click row to expand order details inline OR navigate to detail view
- Bulk status update
- Export to CSV/PDF
```

#### Order Detail View (modal or expandable)
```
Sections:
1. معلومات الطلب — order number, date, status with timeline
2. معلومات العميل — name, email, phone
3. عنوان الشحن — full address
4. المنتجات — table with image, name, quantity, unit price, total
5. ملخص مالي — subtotal, discount, shipping, total
6. معلومات الشحن — carrier, tracking number, estimated delivery
7. ملاحظات — internal notes, customer notes
8. سجل التحديثات — timeline of status changes with timestamps
```

---

### PAGE 6: Financial Management (الإدارة المالية)
**Route:** `/admin/finance`

#### Stats Row (4 cards)
```
Card 1: 💰 إجمالي الإيرادات    — "١٢٥,٤٣٠ $"   — subtitle: "هذا الشهر" — change: "+١٢%↑" green
Card 2: 💳 المعاملات            — "٤٨٦"           — subtitle: "هذا الشهر"
Card 3: 🔄 المستردات            — "٢,٣٤٠ $"      — subtitle: "١٣ عملية"   — color: red
Card 4: 📊 متوسط قيمة الطلب    — "٢٥٨ $"         — change: "+٥%↑" green
```

#### Revenue Chart Section
```
Title: "📈 الإيرادات والمصروفات"
Chart: Dual AreaChart (revenue vs expenses over 12 months)
Toggles: يومي | أسبوعي | شهري | سنوي
```

#### Revenue by Store
```
Title: "🏪 الإيرادات حسب المتجر"
Chart: Horizontal BarChart comparing stores
```

#### Transactions Table
```
Title: "💳 المعاملات المالية"
Filter: Select (الكل / دفعات / استردادات) + DateRangePicker

Columns:
- رقم المعاملة
- نوع (Badge: دفعة=green, استرداد=red)
- المبلغ
- طريقة الدفع (icon + name)
- الطلب المرتبط (#order_id link)
- العميل
- المتجر
- التاريخ
- الحالة (Badge: مكتملة/معلقة/فاشلة)

Features:
- Export button: "تصدير PDF" | "تصدير Excel"
```

---

### PAGE 7: Advanced Analytics (التقارير والتحليلات)
**Route:** `/admin/analytics`

#### Top Filter Bar
```
- DateRangePicker: الفترة الزمنية
- Select: المتجر (الكل / specific stores)
- Button: "تصدير التقرير" (PDF/Excel)
```

#### KPIs Row (4 cards with trend indicators)
```
Card 1: إيرادات الشهر     — "١٢٥,٤٣٠ $"  — "+١٢% عن الشهر السابق" ↑
Card 2: معدل التحويل       — "٣.٨%"        — "+٠.٥%" ↑
Card 3: متوسط قيمة الطلب  — "٢٥٨ $"       — "-٣%" ↓
Card 4: رضا العملاء        — "٤.٧ / ٥"     — "+٠.٢" ↑
```

#### Charts Grid (2x2)
```
Chart 1: Sales Trend — LineChart (daily/weekly/monthly sales)
Chart 2: Sales by Category — PieChart (فسيفساء ٣٥%, خشب مطعّم ٢٥%, زجاج ١٨%, بروكار ١٢%, نحاسيات ١٠%)
Chart 3: Geographic Distribution — BarChart (sales by country/region)
Chart 4: Customer Acquisition — AreaChart (new vs returning customers)
```

#### Detailed Tables (tabs)
```
Tab 1: تقرير المنتجات
  - المنتج | المبيعات | الإيرادات | معدل الإرجاع | التقييم

Tab 2: تقرير العملاء
  - العميل | عدد الطلبات | إجمالي الإنفاق | آخر طلب | القيمة الدائمة (LTV)

Tab 3: تقرير المتاجر
  - المتجر | الإيرادات | الطلبات | المنتجات | متوسط التقييم | معدل الإرجاع
```

---

### PAGE 8: Global Activity Log (سجل النشاطات)
**Route:** `/admin/activity-log`

#### Filter Bar
```
- SearchInput: "🔍 بحث في النشاطات..."
- Select: نوع العملية (الكل / إضافة / تعديل / حذف / تسجيل دخول / تحديث حالة)
- Select: المستخدم (الكل / dropdown of all users)
- Select: القسم (الكل / منتجات / طلبات / مستخدمين / إعدادات / مالية)
- DateRangePicker: الفترة
```

#### Activity Log Table
```
Columns:
- الوقت (formatted: "اليوم ١٠:٣٢ ص" or "أمس ٠٤:٤٥ م" or full date)
- المستخدم (avatar + name + role badge)
- الإجراء (Badge colored by type: إضافة=green, تعديل=blue, حذف=red, تسجيل دخول=gray, تحديث حالة=orange)
- التفاصيل (description of what happened)
- العنصر (what was affected — product name, order #, user name, etc.)
- IP (optional, show on hover)

Features:
- Infinite scroll or pagination
- Real-time updates (optional)
- Export to CSV
- Cannot be deleted (display only, immutable)
```

#### Sample Data
```
"١٠:٣٢ ص" | مدير المتجر ١ (🏪) | تعديل | تم تحديث سعر المنتج من ١٢٠٠$ إلى ١١٠٠$ | طاولة موزاييك
"٠٩:١٥ ص" | Admin (🛡️)           | إضافة | تم إنشاء مستخدم جديد                    | فاطمة الحسن
"أمس ٠٤:٤٥ م" | محمد العلي (🏪) | تحديث حالة | تم تغيير حالة الطلب إلى "تم الشحن" | طلب #1082
"أمس ٠٢:٣٠ م" | Admin (🛡️)       | حذف | تم حذف كوبون خصم منتهي                  | SUMMER2025
```

---

### PAGE 9: Global Messages & Order Requests (الرسائل والطلبات)
**Route:** `/admin/messages`

#### Layout: Two-panel (like email client)
```
┌─────────────────────┬──────────────────────────────┐
│  Message List       │  Message Detail              │
│  (sidebar, 35%)     │  (main area, 65%)            │
│                     │                              │
│  [Search bar]       │  From: جون سميث              │
│  [Tabs: الكل|طلبات  │  Subject: استفسار عن الشحن    │
│   |شكاوى|مخصص]     │  Date: ٠٣/٠٤/٢٠٢٦          │
│                     │  Store: المتجر الرئيسي        │
│  ┌───────────────┐  │  Status: Badge               │
│  │ Message 1  🔴 │  │  ───────────────────         │
│  │ Message 2  🔴 │  │  Message body text...        │
│  │ Message 3     │  │                              │
│  │ Message 4     │  │  ───────────────────         │
│  │ Message 5     │  │  [Reply area]                │
│  └───────────────┘  │  [Assign to] [Escalate]      │
└─────────────────────┴──────────────────────────────┘
```

#### Message Types (tabs)
```
- الكل — all messages
- طلبات مخصصة — custom order requests (from Custom Order form)
- استفسارات — general inquiries
- شكاوى — complaints
- اقتراحات — suggestions
```

#### Message Item in List
```
- Sender avatar (first letter circle)
- Sender name
- Subject (bold if unread)
- Preview text (truncated)
- Time (relative)
- Store name (which store this is about)
- Unread dot (gold circle)
- Priority Badge (if urgent)
```

#### Message Detail View
```
- Full message header (from, to, date, store, type)
- Status Badge (جديد / قيد المعالجة / تم الرد / مغلق)
- Message body
- Attachments (if any — especially for custom orders with reference images)
- Reply thread (conversation history)
- Actions:
  - Reply (textarea + send button)
  - Assign to store/employee (dropdown)
  - Change status (dropdown)
  - Mark as urgent
  - Archive
```

---

### PAGE 10: Notification Management (إدارة الإشعارات)
**Route:** `/admin/notifications`

#### Two Sections with Tabs

#### Tab 1: مركز الإشعارات (Notification Center — Admin's own notifications)
```
List of notifications with:
- Icon (type-based: 🛒 order, ⚠️ alert, 💬 message, 💰 financial, 👥 user)
- Title text
- Description
- Timestamp (relative)
- Read/Unread indicator (gold dot)
- Type Badge
- Click to navigate to related page

Filters: الكل | غير مقروءة | طلبات | تنبيهات | رسائل | مالية
Action: "تحديد الكل كمقروء"
```

#### Tab 2: إعدادات الإشعارات (Notification Rules/Settings)
```
Table of notification rules:
─────────────────────────────────────────────
الحدث                  | البريد | الموقع | Push
─────────────────────────────────────────────
طلب جديد              |  ✅   |  ✅   |  ✅
طلب ملغي              |  ✅   |  ✅   |  ❌
مخزون منخفض           |  ✅   |  ✅   |  ✅
تقييم جديد             |  ❌   |  ✅   |  ❌
رسالة جديدة           |  ✅   |  ✅   |  ✅
مستخدم جديد           |  ❌   |  ✅   |  ❌
عملية مالية كبيرة (>١٠٠٠$) | ✅ | ✅  |  ✅
محاولة دخول مشبوهة     |  ✅   |  ✅   |  ✅
─────────────────────────────────────────────

Each row has toggle switches for email/site/push
Button: "حفظ الإعدادات"
```

---

### PAGE 11: Global Reviews Management (إدارة التقييمات)
**Route:** `/admin/reviews`

#### Stats Row (3 cards)
```
Card 1: ⭐ متوسط التقييم العام   — "٤.٧ / ٥" — with star display
Card 2: 📝 تقييمات جديدة         — "١٥"       — subtitle: "بانتظار المراجعة"
Card 3: 📊 إجمالي التقييمات      — "٣٤٢"
```

#### Rating Distribution Bar
```
٥ نجوم: ████████████████████ 65% (222)
٤ نجوم: ██████████           20% (68)
٣ نجوم: █████                10% (34)
٢ نجوم: ██                    3% (11)
١ نجمة:  █                    2% (7)
```

#### Filter Bar
```
- SearchInput: "🔍 بحث في التقييمات..."
- Select: المتجر (الكل / ...)
- Select: التقييم (الكل / ٥ نجوم / ٤ نجوم / ...)
- Select: الحالة (الكل / منشور / بانتظار / مرفوض)
```

#### Reviews List (card-based, not table)
```
Each Review Card:
┌──────────────────────────────────────────────────┐
│ [Customer Name]  —  [Product Name]    [Status Badge]
│ ★★★★★  (5/5)                          [Date]
│ ──────────────────────────────────────
│ "Review text content here..."
│ ──────────────────────────────────────
│ Store: [store name]
│ [موافقة ✅] [رفض ❌] [حذف 🗑️]  [عرض المنتج →]
└──────────────────────────────────────────────────┘
```

---

### PAGE 12: Global Site Settings (إعدادات الموقع)
**Route:** `/admin/site-settings`

#### Settings organized in tabs or accordion sections:

#### Section 1: معلومات الموقع (Site Info)
```
Fields:
- اسم الموقع (text): "الفن الدمشقي — Damascene Art"
- وصف الموقع (textarea)
- البريد الإلكتروني الرسمي (email)
- رقم الهاتف (text)
- العنوان (text)
- شعار الموقع (file upload with preview)
- أيقونة الموقع/Favicon (file upload)
- روابط التواصل الاجتماعي (facebook, instagram, twitter URLs)

Button: "حفظ التغييرات"
```

#### Section 2: اللغة والعملة (Language & Currency)
```
Fields:
- اللغة الافتراضية (select: العربية / English)
- اللغات المفعّلة (multi-select checkboxes: العربية ✅, English ✅, Français ❌, Deutsch ❌)
- العملة الافتراضية (select: USD / EUR / SYP)
- العملات المفعّلة (multi-select)
- تحديث أسعار الصرف (manual input or auto-fetch toggle)

Button: "حفظ التغييرات"
```

#### Section 3: إعدادات البريد الإلكتروني (Email Settings)
```
Fields:
- SMTP Server (text)
- SMTP Port (number)
- SMTP Username (text)
- SMTP Password (password)
- البريد المرسل (email)
- اسم المرسل (text)
- تشفير (select: TLS / SSL / None)
- Button: "اختبار الاتصال"

Email Templates Preview:
- ترحيب بمستخدم جديد
- تأكيد الطلب
- تم الشحن
- استرداد مالي
- إعادة تعيين كلمة المرور
Each with: "معاينة" | "تعديل" buttons
```

#### Section 4: إعدادات SEO
```
Fields:
- عنوان الصفحة الرئيسية (text)
- الوصف الافتراضي (textarea, max 160 chars with counter)
- الكلمات المفتاحية (tags input)
- Google Analytics ID (text)
- Facebook Pixel ID (text)

Button: "حفظ التغييرات"
```

#### Section 5: وضع الصيانة (Maintenance Mode)
```
- Toggle: تفعيل وضع الصيانة (on/off)
- رسالة الصيانة (textarea): "الموقع تحت الصيانة حالياً، سنعود قريباً..."
- وقت العودة المتوقع (datetime picker)
- Warning: ⚠️ "تفعيل هذا الوضع سيجعل الموقع غير متاح لجميع الزوار"

Button: "حفظ التغييرات"
```

---

### PAGE 13: Admin Profile & Settings (الملف الشخصي)
**Route:** `/admin/profile`

#### Profile Header
```
┌──────────────────────────────────────┐
│  [Avatar/Photo]                      │
│  اسم المشرف العام                    │
│  admin@damascene-art.com             │
│  المشرف العام — منذ يناير ٢٠٢٥      │
└──────────────────────────────────────┘
```

#### Section 1: المعلومات الشخصية
```
Fields:
- الاسم الأول (text)
- اسم العائلة (text)
- البريد الإلكتروني (email)
- رقم الهاتف (text)
- صورة الملف الشخصي (file upload with preview)

Button: "حفظ التغييرات"
```

#### Section 2: تغيير كلمة المرور
```
Fields:
- كلمة المرور الحالية (password)
- كلمة المرور الجديدة (password, with strength indicator)
- تأكيد كلمة المرور الجديدة (password)

Password Strength Indicator:
- Weak (red bar)
- Medium (orange bar)
- Strong (green bar)

Button: "تحديث كلمة المرور"
```

#### Section 3: تفضيلات الإشعارات
```
Toggle switches:
- إشعارات البريد الإلكتروني (on/off)
- إشعارات الموقع (on/off)
- إشعارات Push (on/off)
- ملخص يومي بالبريد (on/off)

Button: "حفظ التفضيلات"
```

#### Section 4: الأجهزة النشطة
```
Table:
- الجهاز (browser + OS icon)
- الموقع (city, country)
- IP Address
- آخر نشاط
- الحالة (Badge: الجهاز الحالي=green, نشط=blue)
- إجراء (Button: "إنهاء الجلسة" for non-current devices)

Button: "إنهاء جميع الجلسات الأخرى"
```

---

## 📁 SUGGESTED PROJECT STRUCTURE

```
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx        — main layout wrapper
│   │   ├── Sidebar.jsx            — collapsible nav sidebar
│   │   └── TopBar.jsx             — top header bar
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx          — generic sortable/filterable table
│   │   ├── Modal.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── Toast.jsx
│   │   ├── InputField.jsx
│   │   ├── SelectField.jsx
│   │   ├── SearchInput.jsx
│   │   ├── FilterBar.jsx
│   │   ├── ActionMenu.jsx
│   │   ├── MiniBar.jsx
│   │   ├── Timeline.jsx
│   │   ├── EmptyState.jsx
│   │   └── Tabs.jsx
│   └── charts/
│       ├── BarChart.jsx
│       ├── LineChart.jsx
│       ├── PieChart.jsx
│       └── AreaChart.jsx
├── pages/
│   └── admin/
│       ├── Dashboard.jsx
│       ├── UserManagement.jsx
│       ├── StoresManagement.jsx
│       ├── ProductsManagement.jsx
│       ├── OrdersManagement.jsx
│       ├── FinancialManagement.jsx
│       ├── Analytics.jsx
│       ├── ActivityLog.jsx
│       ├── Messages.jsx
│       ├── Notifications.jsx
│       ├── ReviewsManagement.jsx
│       ├── SiteSettings.jsx
│       └── AdminProfile.jsx
├── data/
│   └── mockData.js                — all sample data in one file
├── hooks/
│   ├── useSearch.js               — debounced search hook
│   ├── useFilter.js               — filtering logic
│   └── usePagination.js           — pagination logic
├── constants/
│   ├── colors.js                  — color palette
│   ├── navigation.js              — sidebar menu items
│   └── statusMaps.js              — status → color/label mappings
├── utils/
│   ├── formatters.js              — date, currency, number formatters (Arabic numerals)
│   └── helpers.js                 — misc utility functions
├── App.jsx                        — router setup
└── index.js
```

---

## 📊 MOCK DATA REFERENCE

### Status Color Mappings
```javascript
const orderStatusMap = {
  "جديد":         { color: "#2980B9", bg: "#2980B922" },
  "قيد التجهيز":  { color: "#E67E22", bg: "#E67E2222" },
  "تم الشحن":     { color: "#8E44AD", bg: "#8E44AD22" },
  "مكتمل":        { color: "#27AE60", bg: "#27AE6022" },
  "ملغي":         { color: "#C0392B", bg: "#C0392B22" },
  "مرتجع":        { color: "#E74C3C", bg: "#E74C3C22" },
};

const userRoleMap = {
  "أدمن":         { color: "#C0392B", icon: "🛡️" },
  "مدير متجر":    { color: "#C8A45A", icon: "🏪" },
  "عميل":         { color: "#27AE60", icon: "🛍️" },
};

const productCategoryMap = {
  "فسيفساء":      { color: "#C8A45A", icon: "🔶" },
  "خشب مطعّم":    { color: "#5C3D2E", icon: "🪵" },
  "زجاج منفوخ":   { color: "#2980B9", icon: "🫧" },
  "بروكار":       { color: "#8E44AD", icon: "🧵" },
  "نحاسيات":      { color: "#E67E22", icon: "⚱️" },
  "فخار":         { color: "#C0392B", icon: "🏺" },
};
```

### Arabic Number Formatter
```javascript
const toArabicNum = (num) => {
  return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
};

const formatCurrency = (amount) => {
  return `${toArabicNum(amount.toLocaleString())} $`;
};

const formatDate = (date) => {
  // Format as: ٠٣/٠٤/٢٠٢٦
};

const relativeTime = (date) => {
  // Returns: "منذ ٥ دقائق" / "منذ ساعة" / "أمس" / full date
};
```

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

1. **RTL First**: Every component must work in RTL. Use `dir="rtl"` on root. CSS logical properties (margin-inline-start instead of margin-left).

2. **Arabic Font**: Load Tajawal from Google Fonts with weights: 400, 500, 700, 800.

3. **Arabic Numerals**: Use Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) throughout the UI consistently.

4. **Responsive**: Sidebar collapses on smaller screens. Tables become scrollable. Grid columns reduce.

5. **Empty States**: Every table/list must have an empty state with icon, message, and action button.

6. **Loading States**: Add skeleton loaders or spinners for data-heavy pages.

7. **Confirmation Dialogs**: All destructive actions (delete, disable, cancel) must show confirmation modal.

8. **Toast Notifications**: Show success/error toasts after form submissions and actions.

9. **Form Validation**: All forms must have client-side validation with Arabic error messages.

10. **Consistent Spacing**: Use the spacing system defined above. Don't mix random pixel values.

11. **Sidebar State**: Remember collapsed/expanded state (localStorage or state management).

12. **Active Page Highlight**: Sidebar must highlight current page with gold color and right border.

13. **Damascene Identity**: Maintain the gold (#C8A45A) + navy (#1A1F3A) color scheme throughout. This is a luxury art brand — the admin panel should feel premium too.

14. **Charts Library**: Use Recharts for all charts. It supports RTL and custom styling well.

---

## 🔗 DEPENDENCIES

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "recharts": "^2",
  "lucide-react": "^0.383",
  "@heroicons/react": "^2" // (alternative to lucide)
}
```

---

*End of Admin Panel Specification*
*Total Pages: 13 | Total Reusable Components: ~25 | Estimated Development: comprehensive admin panel*
