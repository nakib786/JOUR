# Newsletter Subscription Setup Guide

## Overview
This guide will help you set up the newsletter subscription system with Cloudflare Turnstile integration.

## Features Implemented
- ✅ Email subscription with validation
- ✅ Cloudflare Turnstile bot protection
- ✅ Firebase Firestore database storage
- ✅ Duplicate email prevention
- ✅ Responsive modal UI
- ✅ Dark/light theme support
- ✅ Accessibility features

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Cloudflare Turnstile Keys
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

## Getting Cloudflare Turnstile Keys

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Sign in to your account

2. **Navigate to Turnstile**
   - Go to "Turnstile" in the left sidebar
   - Click "Add Site"

3. **Configure Your Site**
   - **Site name**: Your website name (e.g., "Kahani Roz Newsletter")
   - **Domain**: Your domain (e.g., `yourdomain.com` or `localhost` for development)
   - **Widget mode**: Managed (recommended)
   - **Pre-clearance**: Optional (can be enabled for better UX)

4. **Get Your Keys**
   - **Site Key**: This is public and goes in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret Key**: This is private and goes in `TURNSTILE_SECRET_KEY`

## Database Schema

The subscription system creates a `subscribers` collection in Firestore with the following structure:

```typescript
interface Subscriber {
  email: string;           // Lowercase email address
  subscribedAt: Timestamp; // When they subscribed
  isActive: boolean;       // Subscription status
  source: string;          // Where they subscribed from
  ipAddress: string;       // IP address for analytics
  userAgent: string;       // Browser info for analytics
}
```

## Firestore Security Rules

Add these rules to your `firestore.rules` file:

```javascript
// Allow reading/writing to subscribers collection (server-side only)
match /subscribers/{subscriberId} {
  allow read, write: if false; // Only server-side access
}
```

## API Endpoints

### POST /api/subscribe
Handles new email subscriptions.

**Request Body:**
```json
{
  "email": "user@example.com",
  "turnstileToken": "turnstile_response_token"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter!",
  "subscriberId": "firestore_document_id"
}
```

**Response (Error):**
```json
{
  "error": "Error message here"
}
```

## Testing the System

1. **Development Testing**
   - Use `localhost` as your domain in Turnstile
   - Test with valid and invalid emails
   - Test duplicate email prevention
   - Test Turnstile verification

2. **Production Testing**
   - Update Turnstile domain to your production domain
   - Test from different devices/browsers
   - Monitor Firestore for new subscribers

## Email Notification System (Future Enhancement)

To send emails when new posts are published, you can:

1. **Use Firebase Functions** to trigger emails when new posts are added
2. **Use services like:**
   - SendGrid
   - Mailgun
   - AWS SES
   - Resend

3. **Create an unsubscribe mechanism** with unique tokens

## Security Features

- ✅ Email validation (format and required)
- ✅ Cloudflare Turnstile bot protection
- ✅ Duplicate email prevention
- ✅ Rate limiting (via Turnstile)
- ✅ Input sanitization
- ✅ Server-side validation

## Troubleshooting

### Common Issues:

1. **Turnstile not loading**
   - Check if `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set
   - Verify domain matches Turnstile configuration

2. **Subscription failing**
   - Check `TURNSTILE_SECRET_KEY` is set correctly
   - Verify Firebase configuration
   - Check browser console for errors

3. **Modal not opening**
   - Check for JavaScript errors
   - Verify component imports

### Debug Mode:
Add console logs in the API route to debug issues:

```typescript
console.log('Received subscription request:', { email, turnstileToken });
```

## Next Steps

1. Set up your Cloudflare Turnstile keys
2. Test the subscription system
3. Set up email sending for new posts
4. Add unsubscribe functionality
5. Add admin dashboard to manage subscribers

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs
3. Verify all environment variables are set
4. Test Turnstile configuration separately 