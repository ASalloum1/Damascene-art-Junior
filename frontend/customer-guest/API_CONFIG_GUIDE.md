# API Configuration Guide

## Overview

The API base URL and all endpoints are now managed in a single centralized location. This makes it easy to switch between different API servers or environments.

## Where to Change the URL

### Option 1: Environment Variable (Recommended)
Edit the `.env` file in the `frontend/customer-guest/` directory:

```bash
# .env
VITE_API_BASE_URL=https://your-new-url.com
VITE_SPECIAL_ORDERS_BEARER_TOKEN=your-token-here
```

This is the **recommended approach** because:
- It works across all files automatically
- It's different for development and production
- It's secure (tokens not exposed in code)

### Option 2: Configuration File
If you need to hardcode changes for testing:

Edit `src/config/api.config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-new-url.com',
  // ... rest of config
};
```

## How It Works

### Files Using Global Configuration

1. **src/context/ApiContext.jsx** - Main API context provider
2. **src/pages/RegisterPage.jsx** - User registration
3. **src/pages/ShopPage.jsx** - Product listing
4. **src/pages/ProductPage.jsx** - Product details
5. **vite.config.js** - Development server proxy

### When You Change the URL

Simply update the `.env` file, and all these files will automatically use the new URL:

```env
# Before
VITE_API_BASE_URL=https://undecided-vastly-replica.ngrok-free.dev

# After (when your ngrok URL changes)
VITE_API_BASE_URL=https://abc123-1.2.3.4.ngrok-free.app
```

## Accessing the Configuration

### In Components
```javascript
import { useApi } from '../context/ApiContext.jsx';

export function MyComponent() {
  const { baseUrl, endpoints } = useApi();
  
  // Now you can use baseUrl and endpoints throughout your component
  const response = await fetch(`${baseUrl}${endpoints.products}`);
}
```

### In Non-React Files
```javascript
import { API_CONFIG } from '../config/api.config.js';

// Access base URL
const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.products}`;

// Access headers
const headers = API_CONFIG.DEFAULT_HEADERS;
```

## Available Endpoints

All endpoints are defined in `API_CONFIG.ENDPOINTS`:

- `specialOrders` - `/api/customers/special-orders`
- `contactUs` - `/api/contact`
- `products` - `/api/customers/products`
- `productDetails` - `/api/customers/products/details`
- `login` - `/api/login`
- `register` - `/api/customers/register`

## Example: Adding a New Endpoint

1. Add it to `src/config/api.config.js`:
```javascript
ENDPOINTS: {
  // ... existing endpoints
  newFeature: '/api/new-feature',
}
```

2. Use it in your component:
```javascript
const { baseUrl, endpoints } = useApi();
fetch(`${baseUrl}${endpoints.newFeature}`);
```
