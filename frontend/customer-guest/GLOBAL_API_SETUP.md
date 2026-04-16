# Global API Context Setup Guide

## Overview
The application now uses a global **ApiContext** to manage bearer tokens and API configuration across all pages. This eliminates the need to repeat token setup in each page.

---

## Setup

### 1. ApiContext is Already Configured
The `ApiContext` is already wrapped around your entire application in `App.jsx`.

### 2. Environment Variables (`.env`)
Make sure your `.env` file has the bearer token configured:

```
VITE_API_BASE_URL=https://d8b7-169-150-196-135.ngrok-free.app
VITE_SPECIAL_ORDERS_BEARER_TOKEN=your_actual_token_here
```

---

## Using the API Context in Any Page

### How to Use `useApi()` Hook

Import the hook and use it in any component:

```jsx
import { useApi } from '../context/ApiContext.jsx';

export function MyPage() {
  const { baseUrl, bearerToken, endpoints } = useApi();
  
  // Now use these values in your API calls
  const handleSubmit = async () => {
    const response = await fetch(`${baseUrl}${endpoints.specialOrders}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(data),
    });
  };

  return (
    // Your component JSX
  );
}
```

---

## API Context Properties

The `useApi()` hook returns an object with:

```javascript
{
  baseUrl: string,           // Base API URL (from .env)
  bearerToken: string,       // Bearer token (from .env)
  endpoints: {
    specialOrders: string,   // '/api/customers/special-orders'
    contactUs: string,       // '/api/contact' (add as needed)
    // Add more endpoints here as required
  }
}
```

---

## Adding New Endpoints

To add a new endpoint, edit [ApiContext.jsx](src/context/ApiContext.jsx):

```jsx
export function ApiProvider({ children }) {
  const apiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '...',
    bearerToken: import.meta.env.VITE_SPECIAL_ORDERS_BEARER_TOKEN,
    endpoints: {
      specialOrders: '/api/customers/special-orders',
      contactUs: '/api/contact',
      // ✅ Add new endpoint here
      myNewEndpoint: '/api/my-new-endpoint',
    },
  };
  // ...
}
```

Then use it in your page:

```jsx
const { baseUrl, endpoints } = useApi();
const response = await fetch(`${baseUrl}${endpoints.myNewEndpoint}`, {
  // ...
});
```

---

## Pages Already Updated

✅ **CustomOrderPage** - Uses `useApi()` for special orders
✅ **ContactPage** - Uses `useApi()` for contact submissions

---

## Pages That Need Updating

When implementing API calls in other pages, follow this pattern:

### Before (Old Way)
```jsx
const API_BASE_URL = 'https://d8b7-169-150-196-135.ngrok-free.app';
const BEARER_TOKEN = 'hardcoded_token';

export function MyPage() {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
    headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` },
  });
}
```

### After (New Way)
```jsx
import { useApi } from '../context/ApiContext.jsx';

export function MyPage() {
  const { baseUrl, bearerToken } = useApi();
  
  const response = await fetch(`${baseUrl}/api/endpoint`, {
    headers: { 'Authorization': `Bearer ${bearerToken}` },
  });
}
```

---

## Complete Example: Adding API to a New Page

```jsx
import { useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { Button } from '../components/Button.jsx';
import styles from './MyPage.module.css';

export function MyPage() {
  const { baseUrl, bearerToken, endpoints } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}${endpoints.specialOrders}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          category: 'example',
          budget: 100,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API Error');
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'جاري...' : 'إرسال'}
      </Button>
    </div>
  );
}

export default MyPage;
```

---

## Troubleshooting

### Error: "useApi must be used within ApiProvider"
- **Cause**: Using `useApi()` outside of the app structure
- **Solution**: Make sure you're using it inside a component that's rendered within `App.jsx`

### "Bearer token is not set" warning
- **Cause**: `.env` file doesn't have `VITE_SPECIAL_ORDERS_BEARER_TOKEN`
- **Solution**: Add the token to your `.env` file and restart dev server

### 401 Unauthorized
- **Cause**: Token is invalid or expired
- **Solution**: Get a fresh token from the backend team

---

## Security Best Practices

✅ Never commit `.env` to Git (it's in `.gitignore`)
✅ All tokens are loaded from environment variables
✅ Tokens are only sent over HTTPS (via ngrok)
✅ Use different tokens for dev/staging/production

---

## File Structure

```
customer-guest/
├── src/
│   ├── context/
│   │   └── ApiContext.jsx          # Global API configuration
│   ├── pages/
│   │   ├── CustomOrderPage.jsx     # ✅ Uses useApi()
│   │   ├── ContactPage.jsx         # ✅ Uses useApi()
│   │   └── [Other pages]           # 🔄 Add useApi() as needed
│   └── App.jsx                     # ✅ Wrapped with <ApiProvider>
├── .env                             # Add your bearer token here
├── .env.example                     # Template
└── GLOBAL_API_SETUP.md             # This file
```

---

## Next Steps

1. ✅ Bearer token configured in `.env`
2. ✅ ApiProvider wraps all pages
3. ✅ CustomOrderPage and ContactPage updated
4. 🔄 Update other pages as needed
5. 🔄 Add new endpoints to ApiContext as required

---

## Questions?

Refer to the individual page documentation:
- [CustomOrderPage](../CustomOrderPage.jsx) - Special orders integration
- [ContactPage](../ContactPage.jsx) - Contact us integration
- [API Integration Guide](CUSTOM_ORDER_API_INTEGRATION.md)
