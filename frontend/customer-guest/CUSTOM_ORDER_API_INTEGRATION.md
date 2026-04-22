# Custom Order Page - API Integration Guide

## Overview
The **CustomOrderPage** component has been integrated with the backend Special Orders API. This guide explains the integration details, configuration, and how to set up the authentication.

---

## Configuration

### 1. Environment Setup

The API integration uses the following configuration (in `CustomOrderPage.jsx`):

```javascript
const API_BASE_URL = 'https://d8b7-169-150-196-135.ngrok-free.app';
const API_ENDPOINT = '/api/customers/special-orders';
const BEARER_TOKEN = 'your_bearer_token_here'; // ⚠️ MUST BE CONFIGURED
```

### 2. Setting the Bearer Token

**Option A: Environment Variable (Recommended for Production)**
```javascript
const BEARER_TOKEN = import.meta.env.VITE_SPECIAL_ORDERS_AUTH_TOKEN || 'your_bearer_token_here';
```

Create a `.env` file in the `customer-guest` directory:
```
VITE_SPECIAL_ORDERS_AUTH_TOKEN=your_actual_bearer_token
```

**Option B: Direct Configuration (Development Only)**
Replace `'your_bearer_token_here'` with your actual bearer token in the component.

---

## API Integration Details

### Request Mapping

The form fields are mapped to the API request body as follows:

| Form Field | API Field | Data Type | Notes |
|---|---|---|---|
| اسمك (Name) | — | string | Collected for context, not sent to API |
| البريد الإلكتروني (Email) | — | string | Collected for context, not sent to API |
| نوع المنتج (Product Type) | `category` | string | Direct mapping |
| الأبعاد التقريبية (Dimensions) | `variants` | string | Used if color preferences not provided |
| الألوان والتفاصيل (Color Preferences) | `variants` | string | Overrides dimensions |
| الميزانية التقريبية (Budget) | `budget` | number | Converted to integer |
| وصف القطعة (Description) | `description` | string | Direct mapping |
| صورة مرجعية (Reference Photo) | `photo` | string | File name only (no upload) |

### API Request Body Example

```json
{
  "category": "خشب مطعّم بالصدف",
  "variants": "أزرق، ذهبي",
  "budget": 250,
  "description": "مرآة مخصصة مع تفاصيل فنية",
  "photo": "reference-image.jpg"
}
```

### API Response

**Success Response (200 OK):**
```json
{
  "message": "Special order created successfully.",
  "data": {
    "special_order": {
      "id": 5,
      "customer_id": 2,
      "category": "Handmade Decor",
      "variants": "Blue, Gold",
      "budget": 250,
      "description": "Custom handcrafted mirror frame",
      "photo": "special-order-1.jpg",
      "created_at": "2026-04-16T11:51:31.000000Z",
      "updated_at": "2026-04-16T11:51:31.000000Z"
    }
  }
}
```

**Error Response (4xx/5xx):**
The error message from the API is displayed to the user in Arabic.

---

## Component Features

### Form Validation
✅ Required field validation in Arabic
✅ Email format validation
✅ Budget must be a valid number
✅ Real-time message clearing when user starts editing

### User Feedback
✅ **Success Message**: Displays order ID after successful submission
✅ **Error Message**: Shows error from API or validation message
✅ **Loading State**: Disables form fields and shows "جاري الإرسال..." button text
✅ **File Upload Status**: Shows selected filename after upload

### Accessibility
✅ Proper form labels (Arabic language support)
✅ Disabled state styling for form fields during submission
✅ ARIA labels on interactive elements
✅ Keyboard navigation support

---

## File Upload

Currently, the component **collects the filename but does not upload the binary file**. The API receives only the filename in the `photo` field.

**To implement file upload:**
1. Change form data submission to use `FormData` instead of JSON:
```javascript
const formDataRequest = new FormData();
formDataRequest.append('category', formData.category);
formDataRequest.append('photo', photoFile); // Binary file
// ... other fields
```

2. Update the fetch request to NOT set `Content-Type: application/json` (FormData handles this)

---

## File Structure

```
customer-guest/
├── src/
│   ├── pages/
│   │   ├── CustomOrderPage.jsx          # Main component
│   │   └── CustomOrderPage.module.css   # Styles
│   ├── components/
│   │   ├── InputField.jsx               # Form input (updated with disabled prop)
│   │   ├── InputField.module.css
│   │   ├── Button.jsx                   # Submit button
│   │   └── SectionHeader.jsx
├── CUSTOM_ORDER_API_INTEGRATION.md      # This file
└── package.json
```

---

## Design Tokens Used

The component uses the following design tokens from `styles/tokens.css`:

- **Colors**: `--color-gold`, `--color-navy-light`, `--color-success`, `--color-error`
- **Spacing**: `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`
- **Radius**: `--radius-md`, `--radius-xl`
- **Typography**: `--font-size-base`, `--font-size-sm`
- **Transitions**: `--transition-fast`

---

## Testing the Integration

### Manual Testing Checklist
- [ ] Fill all required fields and submit
- [ ] Verify success message displays with order ID
- [ ] Verify form resets after successful submission
- [ ] Test form validation (try submitting with empty fields)
- [ ] Test error handling (use invalid API token)
- [ ] Verify disabled state during submission
- [ ] Test file upload filename display

### API Testing Tools
- **Postman**: Test the API endpoint directly
- **Browser DevTools**: Check Network tab for request/response
- **Console**: Check for any JavaScript errors

---

## Troubleshooting

### Common Issues

**1. "Authorization" Error**
- Verify the `BEARER_TOKEN` is correct
- Check token hasn't expired
- Ensure token includes the "Bearer " prefix in the header

**2. CORS Error**
- Backend should return proper CORS headers
- ngrok URLs sometimes have CORS restrictions
- Consider adding a backend proxy

**3. Network Error / Timeout**
- Check if the ngrok URL is still active
- Verify internet connection
- Check browser Network tab for failed requests

**4. Form Doesn't Submit**
- Check browser console for errors
- Verify all required fields are filled
- Check that the API endpoint is correctly configured

---

## Future Enhancements

1. **Real File Upload**: Implement multipart/form-data for actual image upload
2. **Image Preview**: Show preview of selected image before submission
3. **Optimistic UI**: Show loading skeleton or placeholder during API call
4. **Rate Limiting**: Add client-side rate limiting to prevent duplicate submissions
5. **Email Notification**: Send confirmation email to customer
6. **Order Tracking**: Allow customers to track order status

---

## Notes for Developers

- The component uses React hooks for state management
- Form submission is handled with async/await pattern
- All error messages are in Arabic for user experience
- The component respects `prefers-reduced-motion` in animations
- All form inputs are properly labeled and accessible
