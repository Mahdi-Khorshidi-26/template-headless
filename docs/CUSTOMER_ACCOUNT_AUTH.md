# Customer Account API Authentication Guide

This guide explains how to implement Customer Account API authentication in your Hydrogen storefront.

## Overview

The Customer Account API uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) for secure authentication. This implementation supports public clients (web browsers, mobile apps) without requiring a client secret.

## Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```env
# Your store's public domain
PUBLIC_STORE_DOMAIN=your-store.myshopify.com

# Customer Account API Client ID from Shopify Admin
# Settings > Customer Accounts > Headless
CUSTOMER_ACCOUNT_CLIENT_ID=your-client-id

# Session secret for cookies
SESSION_SECRET=your-session-secret
```

### 2. Configure Redirect URIs

In your Shopify Admin (Settings > Customer Accounts > Headless), add these allowed redirect URIs:

```
https://your-domain.com/account/authorize/callback
http://localhost:3000/account/authorize/callback
```

## Authentication Flow

### Step 1: Initiate Login

When a customer clicks "Login", redirect them to `/account/authorize`:

```tsx
// In your Header component or login page
<a href="/account/authorize">Login</a>
```

The route handler (`app/routes/account.authorize.tsx`) will:

1. Discover authentication endpoints from Shopify
2. Generate PKCE code verifier and challenge
3. Generate state and nonce for security
4. Store these in the session
5. Redirect to Shopify's login page

### Step 2: Handle Callback

After successful login, Shopify redirects to `/account/authorize/callback` with an authorization code.

The callback handler (`app/routes/account.authorize.callback.tsx`) will:

1. Validate the state parameter (CSRF protection)
2. Exchange the authorization code for access tokens
3. Verify the nonce (replay attack prevention)
4. Store tokens in the session
5. Redirect to the account page

### Step 3: Use Customer API

Once authenticated, you can make requests to the Customer Account API:

```tsx
// In any loader or action
import {
  discoverAPIEndpoints,
  makeCustomerAPIRequest,
} from '~/lib/customer-auth';
import {getValidAccessToken} from '~/lib/customer-session';

export async function loader({context}: LoaderFunctionArgs) {
  const {session, env} = context;

  // Get valid access token (auto-refreshes if expired)
  const accessToken = await getValidAccessToken(
    session,
    env.PUBLIC_STORE_DOMAIN!,
    env.CUSTOMER_ACCOUNT_CLIENT_ID!,
  );

  if (!accessToken) {
    return redirect('/account/authorize');
  }

  // Discover API endpoints
  const apiConfig = await discoverAPIEndpoints(env.PUBLIC_STORE_DOMAIN!);

  // Make API request
  const customerData = await makeCustomerAPIRequest({
    graphqlEndpoint: apiConfig.graphql_api,
    accessToken,
    query: `
      query GetCustomer {
        customer {
          firstName
          lastName
          emailAddress {
            emailAddress
          }
        }
      }
    `,
  });

  return json({customer: customerData.data.customer});
}
```

### Step 4: Logout

To log out a customer:

```tsx
// In your Header component or account page
<a href="/account/logout">Logout</a>
```

The logout handler (`app/routes/account.logout.tsx`) will:

1. Clear session tokens
2. Redirect to Shopify's logout endpoint
3. Shopify redirects back to your homepage

## Session Helpers

Use the session helpers for common authentication tasks:

```tsx
import {
  isCustomerAuthenticated,
  getCustomerTokens,
  getValidAccessToken,
  clearCustomerSession,
} from '~/lib/customer-session';

// Check if customer is logged in
if (isCustomerAuthenticated(session)) {
  // Customer is authenticated
}

// Get tokens manually
const tokens = getCustomerTokens(session);
if (tokens) {
  console.log('Token expires at:', new Date(tokens.expiresAt));
}

// Clear session on error
clearCustomerSession(session);
```

## Protected Routes

Create a utility to protect routes that require authentication:

```tsx
// app/lib/customer-guards.ts
import {redirect} from 'react-router';
import {isCustomerAuthenticated} from '~/lib/customer-session';
import type {LoaderFunctionArgs} from 'react-router';

export function requireCustomerAuth({context}: LoaderFunctionArgs) {
  if (!isCustomerAuthenticated(context.session)) {
    throw redirect('/account/authorize');
  }
}

// Use in your loaders
export async function loader(args: LoaderFunctionArgs) {
  requireCustomerAuth(args);
  // Rest of your loader code...
}
```

## Example Queries

### Get Customer Profile

```graphql
query GetCustomer {
  customer {
    firstName
    lastName
    emailAddress {
      emailAddress
    }
    phoneNumber {
      phoneNumber
    }
  }
}
```

### Get Customer Orders

```graphql
query GetOrders($first: Int = 10) {
  customer {
    orders(first: $first) {
      edges {
        node {
          id
          orderNumber
          totalPrice {
            amount
            currencyCode
          }
          fulfillmentStatus
          lineItems(first: 10) {
            edges {
              node {
                title
                quantity
              }
            }
          }
        }
      }
    }
  }
}
```

### Update Customer Address

```graphql
mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput!) {
  customerAddressUpdate(addressId: $addressId, address: $address) {
    customerAddress {
      id
      address1
      city
      country
    }
    userErrors {
      field
      message
    }
  }
}
```

## Staying Authenticated Through Checkout

To keep customers authenticated when they go to checkout, add `logged_in=true` to the checkout URL:

```tsx
const checkoutUrl = `${checkout.webUrl}?logged_in=true`;
```

## Silent Authentication

To check if a customer has an active session without showing a login screen:

```tsx
// Add prompt=none to the authorization URL
const authUrl = buildAuthorizationUrl({
  // ... other params
  prompt: 'none',
});
```

If the customer is not logged in, the callback will receive `error=login_required`.

## Localization

Support multiple languages in the login screen:

```tsx
const authUrl = buildAuthorizationUrl({
  // ... other params
  locale: 'fr', // French, Spanish (es), German (de), etc.
});
```

## Error Handling

Common errors and their solutions:

### `invalid_grant`

- Ensure your code verifier/challenge is properly base64url encoded
- Remove padding (`=`) characters
- Replace `+` with `-` and `/` with `_`

### `invalid_client`

- Verify your `CUSTOMER_ACCOUNT_CLIENT_ID` is correct
- Check that it matches the Client ID in Shopify Admin

### `invalid_token` (401)

- Ensure `origin` header is set in requests
- Verify the origin is in the allowed JavaScript Origins list
- Add a `user-agent` header to avoid 403 errors

### Token expired

- Tokens automatically refresh using the `getValidAccessToken` helper
- If refresh fails, redirect to login

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate state parameter** to prevent CSRF attacks
3. **Verify nonce** to prevent replay attacks
4. **Store tokens securely** in HTTP-only cookies
5. **Regenerate code verifier** for each authorization request
6. **Set appropriate session timeouts**
7. **Handle token refresh** before expiration

## Troubleshooting

### Tokens not persisting

- Ensure session secret is set
- Check that cookies are being set correctly
- Verify cookie settings (httpOnly, secure, sameSite)

### Redirect loops

- Check that redirect URIs match exactly
- Ensure state validation is working
- Verify session storage is functioning

### API requests failing

- Confirm access token is valid and not expired
- Check that the correct API endpoint is being used
- Verify the GraphQL query syntax is correct

## Resources

- [Customer Account API Documentation](https://shopify.dev/docs/api/customer)
- [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749)
- [PKCE Specification](https://datatracker.ietf.org/doc/html/rfc7636)
- [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
