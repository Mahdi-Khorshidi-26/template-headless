# Finding Headless Customer Account Settings

## You Already Have Customer Account API Configured! ✅

Your `.env` file shows you have:

- Client ID: `cde713cf-2e8c-4473-b687-843c389bc1e3`
- Authorization endpoint already configured
- This means Customer Account API is enabled!

## The Problem:

You just need to **add the redirect URI** to the allowed list in Shopify.

---

## Where to Find It:

### Method 1: Apps and Sales Channels

1. **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **"Develop apps"**
3. Look for an app (might be named "Hydrogen" or similar)
4. Click on it
5. Go to **Configuration** tab
6. Scroll to **Customer Account API**
7. Click **Configure**
8. Add redirect URI: `http://localhost:3001/account/authorize/callback`

### Method 2: Customer Account Applications

Try this direct URL:

```
https://vytfm1-sb.myshopify.com/admin/settings/customer_accounts/applications
```

### Method 3: Check Hydrogen CLI

If you set this up using Shopify Hydrogen CLI, you can manage it through the CLI:

```bash
npx shopify hydrogen env pull
```

This will show you the configuration and might have a link to manage it.

---

## What You're Looking For:

A page with these fields:

- ✅ **Application name**
- ✅ **Callback URIs** (or Redirect URIs) ← This is what you need!
- ✅ **JavaScript Origins**
- ✅ **Logout URIs**

---

## Quick Fix:

Since you already have the endpoints configured, try adding your `.env` variable for the callback:

Add this to your `.env`:

```env
CUSTOMER_ACCOUNT_CLIENT_ID=cde713cf-2e8c-4473-b687-843c389bc1e3
```

Then restart your dev server and try the direct URL approach below.
