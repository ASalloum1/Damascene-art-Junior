# Bearer Token Setup Guide

## Quick Setup

### 1. Copy the environment template
```bash
cp .env.example .env
```

### 2. Add your bearer token to `.env`
```
VITE_API_BASE_URL=https://undecided-vastly-replica.ngrok-free.dev
VITE_SPECIAL_ORDERS_BEARER_TOKEN=your_actual_token_here
```

Replace `your_actual_token_here` with your actual bearer token from the backend.

### 3. Verify the setup
```bash
npm run dev
```

Check browser console:
- ✅ If no warning appears: Token is configured correctly
- ⚠️ If warning appears: Token is missing, check your `.env` file

---

## How It Works

The component reads environment variables at build/runtime:

```javascript
const BEARER_TOKEN = import.meta.env.VITE_SPECIAL_ORDERS_BEARER_TOKEN;
```

**Important**: 
- Only variables prefixed with `VITE_` are exposed to the frontend
- Never commit `.env` to version control (it's in `.gitignore`)
- Always use `.env.example` as a template for other developers

---

## Testing the Bearer Token

### Local Development
1. Start the dev server: `npm run dev`
2. Open DevTools Console (F12)
3. Navigate to Custom Order page
4. If warning shows → token is not set
5. Fill out the form and submit
6. Check Network tab to see the Authorization header

### Check Token in Network
1. Open DevTools → Network tab
2. Submit the form
3. Find the `/api/customers/special-orders` POST request
4. Check Request Headers for `Authorization: Bearer ...`

---

## Common Issues

**Issue**: "VITE_SPECIAL_ORDERS_BEARER_TOKEN is not set"
- **Solution**: Make sure `.env` file exists in `customer-guest/` directory with the token

**Issue**: Still getting 401 Unauthorized
- **Solution**: Token may be expired or invalid. Ask backend team for a new token.

**Issue**: Changes to `.env` not reflecting
- **Solution**: Restart dev server (`Ctrl+C` then `npm run dev`)

---

## Security Notes

✅ `.env` files are automatically ignored by Git (via .gitignore)
✅ Only `VITE_` prefixed variables are exposed to frontend
✅ The token is only sent over HTTPS (via ngrok in this case)
⚠️ In production, use a backend API key or authentication service

---

## For Production Deployment

Replace the environment variable setup:
```javascript
// Instead of reading from .env, use:
const BEARER_TOKEN = process.env.SPECIAL_ORDERS_TOKEN; // For server-side
// Or pass it from backend via API endpoint
```

This prevents exposing tokens in client-side code.
