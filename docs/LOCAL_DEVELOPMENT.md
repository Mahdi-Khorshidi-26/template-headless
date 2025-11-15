# Local Development with Customer Account API

## ⚠️ Problem: Shopify Doesn't Allow Localhost

Shopify's Customer Account API **does not support localhost redirect URIs** for security reasons. This means you cannot test authentication on `http://localhost:3001`.

## ✅ Solutions

### Solution 1: Use Oxygen Deployment (Easiest)

Test authentication on your deployed Oxygen site instead of locally.

#### Steps:
1. **Deploy your code to Oxygen:**
   ```bash
   npx shopify hydrogen deploy
   ```

2. **Add the redirect URI in Shopify:**
   - Go to your Customer Account API settings
   - Add: `https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev/account/authorize/callback`

3. **Test on deployed site:**
   - Visit: `https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev/account/login`
   - Click "Login with Shopify"
   - Should work! ✅

#### Pros:
- ✅ No additional tools needed
- ✅ Tests in real production environment
- ✅ Fast and simple

#### Cons:
- ❌ Need to deploy after each change
- ❌ Slower development cycle

---

### Solution 2: Use ngrok for Local Development

Create a public HTTPS tunnel to your localhost.

#### Steps:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```
   Or download from: https://ngrok.com/download

2. **Start your dev server:**
   ```bash
   npm run dev
   ```
   (Should be running on port 3001)

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copy the ngrok URL:**
   You'll see something like:
   ```
   Forwarding: https://abc123def456.ngrok.io -> http://localhost:3001
   ```

5. **Add ngrok URL to Shopify:**
   - Go to Customer Account API settings
   - Add redirect URI: `https://abc123def456.ngrok.io/account/authorize/callback`
   - Add JavaScript origin: `https://abc123def456.ngrok.io`

6. **Update your .env file:**
   ```env
   # Use this for local development with ngrok
   # Comment out when deploying
   # PUBLIC_NGROK_URL=https://abc123def456.ngrok.io
   ```

7. **Test locally:**
   - Visit: `https://abc123def456.ngrok.io/account/login`
   - Should work! ✅

#### Pros:
- ✅ Test authentication locally
- ✅ Fast development cycle
- ✅ Real-time testing

#### Cons:
- ❌ URL changes each time (free tier)
- ❌ Extra tool to manage
- ❌ Need to update Shopify config when URL changes

#### ngrok Pro Tip:
Get a fixed domain with ngrok pro:
```bash
ngrok http 3001 --domain=yourapp.ngrok.io
```

---

### Solution 3: Use Cloudflare Tunnel (Alternative to ngrok)

Similar to ngrok but free fixed domains.

#### Steps:

1. **Install Cloudflare Tunnel:**
   ```bash
   npm install -g cloudflared
   ```

2. **Start tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

3. **Use the provided URL** in Shopify configuration

---

### Solution 4: Mock Authentication for Local Development

Create a development-only bypass for authentication.

#### Steps:

1. **Create a mock auth route:**
   ```typescript
   // app/routes/account.dev-login.tsx
   import {redirect} from 'react-router';
   
   export async function loader({context}: LoaderFunctionArgs) {
     const {session} = context;
     
     // Only in development!
     if (process.env.NODE_ENV !== 'development') {
       throw new Response('Not Found', {status: 404});
     }
     
     // Mock customer data
     session.set('customer_access_token', 'dev-token');
     session.set('customer_id', 'dev-customer-123');
     
     return redirect('/account', {
       headers: {
         'Set-Cookie': await session.commit(),
       },
     });
   }
   ```

2. **For local testing:**
   - Visit: `http://localhost:3001/account/dev-login`
   - This bypasses real authentication

#### Pros:
- ✅ Works completely offline
- ✅ No external tools needed
- ✅ Fast development

#### Cons:
- ❌ Not testing real authentication flow
- ❌ May miss edge cases
- ❌ Need to remember to remove before deploying

---

## 🎯 Recommended Workflow

**For Most Developers:**

1. **Use Mock Auth for local development** (Solution 4)
   - Fast development of UI/UX
   - No network dependencies

2. **Test on Oxygen periodically** (Solution 1)
   - Verify real authentication works
   - Before merging to main

3. **Use ngrok for debugging** (Solution 2)
   - When you need to test the actual OAuth flow locally
   - For troubleshooting authentication issues

---

## 📋 Current Configuration

**Your Oxygen URL:**
```
https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev
```

**Required Redirect URI in Shopify:**
```
https://template-headless-68dbe0f94e83026786c2.o2.myshopify.dev/account/authorize/callback
```

**To add this:**
1. Go to Shopify Partners: https://partners.shopify.com
2. Find your Hydrogen storefront
3. Add the redirect URI above
4. Deploy and test!

---

## 🚀 Quick Start

**Option 1 - Test on Oxygen (Easiest):**
```bash
npx shopify hydrogen deploy
# Then visit your Oxygen URL
```

**Option 2 - Use ngrok:**
```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3001
# Copy the https URL and add to Shopify
```

---

## ❓ FAQ

**Q: Why doesn't Shopify allow localhost?**
A: For security reasons. Customer Account API requires HTTPS and a public domain.

**Q: Can I use a custom domain?**
A: Yes! If you have a custom domain pointing to your Oxygen deployment, you can use that.

**Q: Does ngrok cost money?**
A: Free tier works but URL changes. Pro tier ($10/month) gives you a fixed domain.

**Q: What about development stores?**
A: Same rules apply - localhost is not allowed.
