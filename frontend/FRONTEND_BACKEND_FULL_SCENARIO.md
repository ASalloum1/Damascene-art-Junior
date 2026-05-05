# Frontend + Backend Full Scenario

This file describes how the three frontend apps currently work with the Laravel API and what is already wired in code.

Updated on `2026-05-05`.

## 1. Frontend Structure

The `frontend/` directory contains three Vite apps:

1. `customer-guest`
2. `Admin-panel`
3. `store-manager-dashboard`

All three now have real backend integration.

## 2. One Entry Point

The visible entry point is:

- `http://localhost:5173/`

From there:

- customer stays on `/`
- admin opens through `/admin/`
- store manager opens through `/store/`

Development ports:

- customer app: `5173`
- admin app: `5174`
- store manager app: `5175`

Relevant files:

- [frontend/package.json](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/package.json)
- [frontend/customer-guest/vite.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/vite.config.js)
- [frontend/Admin-panel/vite.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/vite.config.js)
- [frontend/store-manager-dashboard/vite.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/vite.config.js)

## 3. Run Commands

Customer only:

```bash
cd frontend
npm run dev
```

Whole frontend:

```bash
cd frontend
npm run dev:all
```

Important:

- use `npm run dev` when testing customer only
- use `npm run dev:all` when testing login redirect into admin and store manager through the same browser origin

## 4. Shared Auth Flow

Customer login and registration happen in the customer app.

Connected endpoints:

- `POST /api/login`
- `POST /api/customers/register`

Current behavior:

- login stores `token` and `user` in `localStorage`
- register creates the customer, then performs automatic login because the register API does not return a token
- after login:
  - `admin` redirects to `/admin/`
  - `store-manager` redirects to `/store/`
  - `customers` redirects to `/`

Relevant files:

- [frontend/customer-guest/src/utils/auth.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/utils/auth.js)
- [frontend/customer-guest/src/context/ApiContext.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/context/ApiContext.jsx)
- [frontend/Admin-panel/src/context/AdminContext.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/context/AdminContext.jsx)
- [frontend/store-manager-dashboard/src/context/StoreManagerContext.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/context/StoreManagerContext.jsx)

Admin and store manager apps now:

- read the same `localStorage` session
- guard access by actor type
- redirect to `/` if the wrong role opens the panel
- load profile and notifications on bootstrap

## 5. Environment

Current customer `.env`:

- [frontend/customer-guest/.env](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/.env)

Main backend URL variable:

```env
VITE_API_BASE_URL=https://unincriminating-nola-phonogramically.ngrok-free.dev
```

Admin and store manager use their own API config files but the same base URL convention:

- [frontend/customer-guest/src/config/api.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/config/api.config.js)
- [frontend/Admin-panel/src/config/api.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/config/api.config.js)
- [frontend/store-manager-dashboard/src/config/api.config.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/config/api.config.js)

## 6. Customer App Integration

### Public customer pages

Connected:

- homepage categories: `GET /api/customers/categories`
- shop listing: `GET /api/customers/products`
- search page: `GET /api/customers/search`
- category page: `GET /api/customers/categories/{category}/products`
- product details: `POST /api/customers/products/details`

Relevant files:

- [frontend/customer-guest/src/pages/HomePage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/HomePage.jsx)
- [frontend/customer-guest/src/pages/ShopPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/ShopPage.jsx)
- [frontend/customer-guest/src/pages/SearchPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/SearchPage.jsx)
- [frontend/customer-guest/src/pages/CategoryPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/CategoryPage.jsx)
- [frontend/customer-guest/src/pages/ProductPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/ProductPage.jsx)

### Protected customer flows

Connected:

- account summary: `GET /api/customers/account`
- profile update: `GET/PUT /api/customers/profile`
- password update: `PUT /api/customers/profile/password`
- cart summary: `GET /api/customers/cart-summary`
- current cart: `GET /api/customers/carts/in-progres`
- add to cart: `POST /api/customers/product-carts`
- cart quantity update: `POST /api/customers/product-carts/plus-one`
- cart quantity decrease: `POST /api/customers/product-carts/minus-one`
- cart item delete: `POST /api/customers/product-carts/delete`
- apply coupon: `POST /api/customers/carts/apply-coupon`
- wishlist list/add: `GET/POST /api/customers/wish-lists`
- addresses list/create/delete: `GET/POST /api/customers/addresses`, `POST /api/customers/addresses/delete`
- latest orders: `GET /api/customers/orders/latest`
- order tracking: `GET /api/customers/orders/{cart}/tracking`
- checkout: `POST /api/customers/checkout`
- contact us: `POST /api/customers/contact-us`
- special orders: `POST /api/customers/special-orders`

Relevant files:

- [frontend/customer-guest/src/pages/AccountPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/AccountPage.jsx)
- [frontend/customer-guest/src/pages/CartPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/CartPage.jsx)
- [frontend/customer-guest/src/pages/WishlistPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/WishlistPage.jsx)
- [frontend/customer-guest/src/pages/CheckoutPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/CheckoutPage.jsx)
- [frontend/customer-guest/src/pages/ConfirmationPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/ConfirmationPage.jsx)
- [frontend/customer-guest/src/pages/TrackingPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/TrackingPage.jsx)
- [frontend/customer-guest/src/pages/ContactPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/ContactPage.jsx)
- [frontend/customer-guest/src/pages/CustomOrderPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/customer-guest/src/pages/CustomOrderPage.jsx)

## 7. Admin Panel Integration

The admin panel now uses live backend APIs for:

- bootstrap profile and notifications
- dashboard summary
- analytics page
- financial page
- users list/create/edit/reset password
- stores list/create/edit/status
- products list/create/edit/delete/status
- orders list/details/status
- coupons list/create/edit/delete
- messages inbox and reply/status
- reviews moderation
- notifications list/read/read-all
- profile load/update/password

Relevant files:

- [frontend/Admin-panel/src/App.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/App.jsx)
- [frontend/Admin-panel/src/pages/admin/Dashboard.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/Dashboard.jsx)
- [frontend/Admin-panel/src/pages/admin/Analytics.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/Analytics.jsx)
- [frontend/Admin-panel/src/pages/admin/FinancialManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/FinancialManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/UserManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/UserManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/StoresManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/StoresManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/ProductsManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/ProductsManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/OrdersManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/OrdersManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/CouponsManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/CouponsManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/Messages.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/Messages.jsx)
- [frontend/Admin-panel/src/pages/admin/ReviewsManagement.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/ReviewsManagement.jsx)
- [frontend/Admin-panel/src/pages/admin/Notifications.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/Notifications.jsx)
- [frontend/Admin-panel/src/pages/admin/AdminProfile.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/pages/admin/AdminProfile.jsx)

## 8. Store Manager Integration

The store manager app now uses live backend APIs for:

- bootstrap profile and notifications
- dashboard summary
- inventory page
- reports page
- products list/create/edit/delete/status
- orders list/details/status
- messages inbox/status
- reviews moderation
- notifications list/read/read-all
- profile load/update/password

Relevant files:

- [frontend/store-manager-dashboard/src/App.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/App.jsx)
- [frontend/store-manager-dashboard/src/pages/DashboardPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/DashboardPage.jsx)
- [frontend/store-manager-dashboard/src/pages/InventoryPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/InventoryPage.jsx)
- [frontend/store-manager-dashboard/src/pages/ReportsPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/ReportsPage.jsx)
- [frontend/store-manager-dashboard/src/pages/ProductsPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/ProductsPage.jsx)
- [frontend/store-manager-dashboard/src/pages/OrdersPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/OrdersPage.jsx)
- [frontend/store-manager-dashboard/src/pages/MessagesPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/MessagesPage.jsx)
- [frontend/store-manager-dashboard/src/pages/ReviewsPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/ReviewsPage.jsx)
- [frontend/store-manager-dashboard/src/pages/NotificationsPage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/NotificationsPage.jsx)
- [frontend/store-manager-dashboard/src/pages/ProfilePage.jsx](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/pages/ProfilePage.jsx)

## 9. Utilities Added

Shared app-specific helpers now exist for admin and store manager:

- [frontend/Admin-panel/src/utils/adminApi.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/Admin-panel/src/utils/adminApi.js)
- [frontend/store-manager-dashboard/src/utils/storeApi.js](/Users/yazanmaksoud/Documents/Damascene-art-Junior/frontend/store-manager-dashboard/src/utils/storeApi.js)

These handle:

- session reading
- role protection
- auth headers
- JSON request helpers
- backend status/payment label mapping

## 10. Verification

The following builds passed after the integration pass:

- `frontend/customer-guest`: `npm run build`
- `frontend/Admin-panel`: `npm run build`
- `frontend/store-manager-dashboard`: `npm run build`

## 11. Known Limits

These are the main remaining technical limitations:

- customer custom order photo upload still behaves as a string/path flow, not full `multipart/form-data`
- admin and store manager product image submission currently sends the selected filename/string, not binary upload
- some dashboard/report charts depend on the exact response shape returned by the backend and may need small mapper adjustments if the API payload changes
- the apps are still three separate Vite apps behind a unified dev entry point, not one merged React SPA

## 12. Recommended Test Scenario

Use this full scenario when testing end to end:

1. Run `cd frontend && npm run dev:all`
2. Open `http://localhost:5173/`
3. Register or log in as customer and test:
   - categories
   - products
   - cart
   - wishlist
   - checkout
   - account
4. Log in as admin and test:
   - `/admin/`
   - dashboard
   - users
   - stores
   - products
   - orders
   - coupons
   - messages
   - reviews
   - notifications
5. Log in as store manager and test:
   - `/store/`
   - dashboard
   - inventory
   - reports
   - products
   - orders
   - messages
   - reviews
   - notifications

