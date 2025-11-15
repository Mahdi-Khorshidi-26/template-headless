# Customer Account API - Quick Start

This directory contains a complete implementation of Shopify's Customer Account API authentication for your Hydrogen storefront.

## 📁 Files Created

### Core Authentication Library

- **`app/lib/customer-auth.ts`** - Main authentication utilities
  - OAuth 2.0 + PKCE flow implementation
  - Token management
  - API endpoint discovery
  - Request helpers

- **`app/lib/customer-session.ts`** - Session management helpers
  - Check authentication status
  - Auto-refresh expired tokens
  - Session storage utilities

- **`app/lib/customer-env.d.ts`** - TypeScript definitions for environment variables

### Routes

- **`app/routes/account.authorize.tsx`** - Login initiation
- **`app/routes/account.authorize.callback.tsx`** - OAuth callback handler
- **`app/routes/account.logout.tsx`** - Logout handler
- **`app/routes/account._index.tsx`** - Example account page

### Documentation

- **`docs/CUSTOMER_ACCOUNT_AUTH.md`** - Complete implementation guide

## 🚀 Quick Setup

### 1. Configure Environment Variables

Add to your `.env` file:

```env
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
CUSTOMER_ACCOUNT_CLIENT_ID=your-client-id
SESSION_SECRET=your-session-secret
```

### 2. Get Your Client ID

1. Go to Shopify Admin
2. Navigate to: **Settings** → **Customer Accounts** → **Headless**
3. Copy your **Client ID**

### 3. Configure Redirect URIs

In the same Headless settings page, add these allowed redirect URIs:

**Development:**

```
http://localhost:3000/account/authorize/callback
```

**Production:**

```
https://your-domain.com/account/authorize/callback
```

### 4. Add Login Links

In your header or navigation component:

```tsx
// For login
<a href="/account/authorize">Login</a>

// For logout (when authenticated)
<a href="/account/logout">Logout</a>
```

## 🔐 How It Works

### Authentication Flow

```
1. Customer clicks "Login"
   ↓
2. Redirect to /account/authorize
   ↓
3. Generate security parameters (PKCE, state, nonce)
   ↓
4. Redirect to Shopify login page
   ↓
5. Customer logs in
   ↓
6. Shopify redirects to /account/authorize/callback with code
   ↓
7. Exchange code for access token
   ↓
8. Store tokens in session
   ↓
9. Redirect to /account
```

### Token Management

Tokens are automatically managed:

- ✅ Stored securely in HTTP-only cookies
- ✅ Auto-refreshed when expired
- ✅ Validated on each request

## 📖 Usage Examples

### Check if Customer is Authenticated

```tsx
import {isCustomerAuthenticated} from '~/lib/customer-session';

export async function loader({context}: LoaderFunctionArgs) {
  if (!isCustomerAuthenticated(context.session)) {
    return redirect('/account/authorize');
  }
  // Customer is authenticated
}
```

### Make API Requests

```tsx
import {
  discoverAPIEndpoints,
  makeCustomerAPIRequest,
} from '~/lib/customer-auth';
import {getValidAccessToken} from '~/lib/customer-session';

export async function loader({context}: LoaderFunctionArgs) {
  const {session, env} = context;

  // Get valid token (auto-refreshes if needed)
  const accessToken = await getValidAccessToken(
    session,
    env.PUBLIC_STORE_DOMAIN!,
    env.CUSTOMER_ACCOUNT_CLIENT_ID!,
  );

  if (!accessToken) {
    return redirect('/account/authorize');
  }

  // Get API endpoint
  const apiConfig = await discoverAPIEndpoints(env.PUBLIC_STORE_DOMAIN!);

  // Make request
  const data = await makeCustomerAPIRequest({
    graphqlEndpoint: apiConfig.graphql_api,
    accessToken,
    query: `
      query {
        customer {
          firstName
          lastName
        }
      }
    `,
  });

  return {customer: data.data.customer};
}
```

### Protect Routes

```tsx
// Create a guard utility
export function requireAuth(args: LoaderFunctionArgs) {
  if (!isCustomerAuthenticated(args.context.session)) {
    throw redirect('/account/authorize');
  }
}

// Use in loaders
export async function loader(args: LoaderFunctionArgs) {
  requireAuth(args);
  // Protected route code...
}
```

## 🎯 Common Use Cases

### Get Customer Orders

```graphql
query GetOrders {
  customer {
    orders(first: 10) {
      edges {
        node {
          id
          orderNumber
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
}
```

### Update Customer Profile

```graphql
mutation UpdateProfile($input: CustomerUpdateInput!) {
  customerUpdate(input: $input) {
    customer {
      firstName
      lastName
    }
    userErrors {
      field
      message
    }
  }
}
```

### Manage Addresses

```graphql
mutation CreateAddress($address: CustomerAddressInput!) {
  customerAddressCreate(address: $address) {
    customerAddress {
      id
      address1
      city
    }
    userErrors {
      field
      message
    }
  }
}
```

## 🔧 Configuration Options

### Localization

Support multiple languages:

```tsx
import {buildAuthorizationUrl} from '~/lib/customer-auth';

const authUrl = buildAuthorizationUrl({
  // ... other params
  locale: 'fr', // French, Spanish (es), German (de), etc.
});
```

### Silent Authentication

Check for active session without showing login:

```tsx
const authUrl = buildAuthorizationUrl({
  // ... other params
  prompt: 'none', // No login screen shown
});
```

### Checkout Integration

Keep customers authenticated through checkout:

```tsx
const checkoutUrl = `${checkout.webUrl}?logged_in=true`;
```

## 🐛 Troubleshooting

### "Required environment variables not set"

- Verify `.env` file contains all required variables
- Restart dev server after changing `.env`

### "Invalid redirect URI"

- Ensure redirect URI in Shopify Admin matches exactly
- Include protocol (http:// or https://)
- Include port for localhost (e.g., :3000)

### "State mismatch"

- Check session secret is set correctly
- Verify cookies are being stored
- Try clearing browser cookies

### Tokens not refreshing

- Check token expiration time
- Verify `getValidAccessToken` is being used
- Ensure shop domain and client ID are correct

## 📚 Additional Resources

- [Full Authentication Guide](../docs/CUSTOMER_ACCOUNT_AUTH.md)
- [Customer Account API Docs](https://shopify.dev/docs/api/customer)
- [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE Specification](https://datatracker.ietf.org/doc/html/rfc7636)

## 🔒 Security Notes

- ✅ Uses PKCE for secure public client authentication
- ✅ State parameter prevents CSRF attacks
- ✅ Nonce prevents replay attacks
- ✅ Tokens stored in HTTP-only cookies
- ✅ Auto-refresh prevents expired token usage
- ✅ Secure by default configuration

## 🤝 Support

For issues or questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [full guide](../docs/CUSTOMER_ACCOUNT_AUTH.md)
3. Consult [Shopify's documentation](https://shopify.dev/docs/api/customer)

---

**Ready to test?** Run your dev server and navigate to `/account/authorize` to see the authentication flow in action!
