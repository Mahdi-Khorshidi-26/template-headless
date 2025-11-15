# Customer Account API - Troubleshooting Guide

## Common Error: "Failed to discover auth endpoints: Forbidden"

This error occurs when trying to access the discovery endpoint and getting a 403 Forbidden response. This typically means Customer Accounts are not properly configured.

### Solution Steps:

#### 1. Enable Customer Accounts in Shopify Admin

1. Log into your **Shopify Admin**
2. Navigate to: **Settings** → **Customer Accounts**
3. Under "Customer account login", select one of these options:
   - **Classic customer accounts** (traditional login)
   - **New customer accounts** (recommended for headless)
4. **Enable "Headless" customer accounts**
   - Look for the "Headless" section
   - Click "Set up" or "Configure"

#### 2. Configure Headless Settings

Once in the Headless configuration:

1. **Application name**: Give your storefront a name (e.g., "My Hydrogen Store")

2. **Callback URIs** (Redirect URIs):
   - Add for development: `http://localhost:3001/account/authorize/callback`
   - Add for production: `https://yourdomain.com/account/authorize/callback`
   - **Important**: Must match exactly (including protocol and port)

3. **JavaScript Origins** (CORS):
   - Add for development: `http://localhost:3001`
   - Add for production: `https://yourdomain.com`

4. **Logout URIs**:
   - Add for development: `http://localhost:3001`
   - Add for production: `https://yourdomain.com`

5. **Copy your Client ID** - You'll need this for the `.env` file

#### 3. Update Environment Variables

Make sure your `.env` file has:

```env
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
CUSTOMER_ACCOUNT_CLIENT_ID=your-client-id-from-shopify
SESSION_SECRET=your-random-secret
```

**Note:** The variable name in Oxygen might be `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, but locally we use `CUSTOMER_ACCOUNT_CLIENT_ID`.

#### 4. Restart Your Dev Server

After making changes:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Other Common Errors

### Error: "CUSTOMER_ACCOUNT_CLIENT_ID environment variable is not set"

**Cause**: Missing or incorrectly named environment variable

**Solution**:

1. Check your `.env` file
2. Ensure the variable is named exactly: `CUSTOMER_ACCOUNT_CLIENT_ID`
3. Restart the dev server

### Error: "Invalid redirect URI"

**Cause**: The callback URI doesn't match what's configured in Shopify

**Solution**:

1. Check the exact URL in your browser when the error occurs
2. Go to Shopify Admin → Settings → Customer Accounts → Headless
3. Make sure the callback URI matches **exactly** (including port number)
4. Common mistake: Using `localhost:3000` when server is on `3001`

### Error: "State mismatch - possible CSRF attack"

**Cause**: Session not being maintained properly

**Solution**:

1. Check that `SESSION_SECRET` is set in `.env`
2. Clear your browser cookies
3. Make sure cookies are enabled in your browser
4. Try in an incognito/private window

### Error: "Token exchange failed"

**Cause**: Various authentication issues

**Solution**:

1. Verify your Client ID is correct
2. Check that the redirect URI is configured correctly
3. Ensure you're using the right shop domain
4. Check browser console for more details

### Error: "invalid_grant" (400)

**Cause**: Issue with PKCE code challenge/verifier

**Solution**:

1. This is usually handled automatically
2. Clear browser cookies and try again
3. Make sure your code verifier generation is working

### Error: "invalid_client" (401)

**Cause**: Wrong Client ID

**Solution**:

1. Double-check the Client ID in your `.env` file
2. Copy it again from Shopify Admin
3. Make sure there are no extra spaces or characters

---

## Verification Checklist

Before testing, verify:

- [ ] Customer Accounts are enabled in Shopify Admin
- [ ] Headless configuration is set up
- [ ] Callback URI includes `/account/authorize/callback`
- [ ] Callback URI matches your local dev server port
- [ ] JavaScript Origins are configured
- [ ] Client ID is copied to `.env` file
- [ ] `SESSION_SECRET` is set in `.env`
- [ ] `PUBLIC_STORE_DOMAIN` matches your actual store domain
- [ ] Dev server has been restarted after `.env` changes

---

## Testing Your Setup

### 1. Test Discovery Endpoints

Try accessing these URLs in your browser:

```
https://your-store.myshopify.com/.well-known/openid-configuration
https://your-store.myshopify.com/.well-known/customer-account-api
```

**Expected**: JSON response with configuration
**If 403/Forbidden**: Customer Accounts not enabled or not configured for headless

### 2. Test Login Flow

1. Navigate to: `http://localhost:3001/account/login`
2. Click "Login with Shopify"
3. Should redirect to Shopify login page
4. After login, should redirect back to your site
5. Should be logged in and see account page

### 3. Check Server Logs

When testing, watch your terminal for errors:

- Look for "Authorization error" messages
- Check for "Failed to discover" messages
- Note any 403, 401, or 500 errors

---

## Still Having Issues?

### Check Your Shopify Plan

Some Shopify plans may have restrictions on Customer Account API access:

- **Shopify Plus**: Full access
- **Advanced Shopify**: Generally supported
- **Shopify / Basic**: May have limitations

Contact Shopify Support to verify your plan includes Customer Account API access.

### Verify Store Status

Make sure your store:

- Is not in test/dev mode (unless testing)
- Has an active Shopify plan
- Is not frozen or suspended
- Has customers enabled

### Check Network Requests

Use browser Developer Tools (F12):

1. Go to Network tab
2. Try logging in
3. Look for failed requests
4. Check response bodies for error messages

### Review Shopify Status

Check if there are any ongoing issues:

- Visit: https://www.shopifystatus.com
- Look for Customer Account API issues

---

## Getting Help

If you're still stuck:

1. **Check the Console**
   - Browser console (F12)
   - Server terminal output
   - Look for detailed error messages

2. **Review Documentation**
   - `docs/CUSTOMER_ACCOUNT_AUTH.md` - Full implementation guide
   - `app/lib/CUSTOMER_AUTH_README.md` - Quick start guide

3. **Shopify Support**
   - Contact Shopify Partner Support
   - Provide error messages and steps to reproduce
   - Mention you're using Customer Account API with Hydrogen

4. **Community**
   - Shopify Community Forums
   - Hydrogen Discord
   - GitHub Issues

---

## Debug Mode

To enable more detailed logging, you can temporarily add console logs:

```typescript
// In app/lib/customer-auth.ts
console.log('Attempting discovery:', discoveryUrl);
console.log('Environment:', {shopDomain, clientId});
```

This will help identify exactly where the issue is occurring.
