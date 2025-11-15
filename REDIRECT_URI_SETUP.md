# Customer Account API - Redirect URI Configuration

## ⚠️ Important: Localhost Not Supported!

**Shopify does NOT allow localhost redirect URIs for Customer Account API.**

You must use one of these options:
1. Your Oxygen deployment URL (Production/Staging)
2. A tunneling service like ngrok for local development

## Your Configuration Details

- **Store**: vytfm1-sb.myshopify.com
- **Shop ID**: 91454472574
- **Client ID**: cde713cf-2e8c-4473-b687-843c389bc1e3
- **Oxygen URL**: https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev

## Where to Configure (In Order of Likelihood)

### 1. Shopify Partners Dashboard ⭐ (Most Likely)
1. Go to: https://partners.shopify.com
2. Select your organization
3. Click "Apps" or "Storefronts"
4. Find "template-headless"
5. Go to "Configuration" or "Settings"
6. Look for "Customer Account API" section
7. Add redirect URI: `http://localhost:3001/account/authorize/callback`

### 2. Oxygen Dashboard
1. Your Hydrogen storefront: https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev
2. Look for a settings/configuration link
3. Find OAuth or Customer Account settings

### 3. Shopify Admin - Custom Apps
1. Go to: https://vytfm1-sb.myshopify.com/admin/settings/apps/development
2. Look for your Hydrogen/Customer Account app
3. Edit and add redirect URI

### 4. Contact Shopify Support
If you can't find it anywhere:
- Email: partners-support@shopify.com
- Or: https://help.shopify.com/partners
- Request: "Please add redirect URI to my Customer Account API configuration"

## Required Configuration

Add these to your Customer Account API settings:

### Callback URIs (Redirect URIs)
⚠️ **DO NOT use localhost** - Shopify doesn't support it!

**For Production/Testing:**
```
https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev/account/authorize/callback
```

**For Local Development (use ngrok):**
```
https://YOUR-NGROK-ID.ngrok.io/account/authorize/callback
```

### JavaScript Origins
```
https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev
```

### Logout URIs
```
https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev
```

## Verification

After adding the redirect URI:
1. Wait 30-60 seconds for changes to propagate
2. Clear your browser cookies
3. Go to: http://localhost:3001/account/login
4. Click "Login with Shopify"
5. Should work! ✅

## Troubleshooting

If still not working after configuration:
- Clear browser cache and cookies
- Try incognito/private window
- Restart dev server: `npm run dev`
- Double-check URIs match exactly (no trailing slashes, correct port)
