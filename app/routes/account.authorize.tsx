/**
 * Customer Account Authorization Route
 * Initiates OAuth 2.0 + PKCE flow
 */
import {redirect, type LoaderFunctionArgs} from 'react-router';
import {
  discoverAuthEndpoints,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  buildAuthorizationUrl,
  SESSION_KEYS,
} from '~/lib/customer-auth';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {session, env} = context;

  // Get shop domain from environment
  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  if (!shopDomain) {
    throw new Error('PUBLIC_STORE_DOMAIN environment variable is not set');
  }

  // Try multiple possible client ID env variables (Oxygen vs local)
  const clientId =
    env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || env.CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'CUSTOMER_ACCOUNT_CLIENT_ID environment variable is not set',
    );
  }

  // Get SHOP_ID from env or extract from PUBLIC_CUSTOMER_ACCOUNT_API_URL
  let shopId: string | undefined = env.SHOP_ID;
  if (!shopId && env.PUBLIC_CUSTOMER_ACCOUNT_API_URL) {
    // Extract shop ID from URL like: https://shopify.com/91454472574
    const match = env.PUBLIC_CUSTOMER_ACCOUNT_API_URL.match(/\/(\d+)$/);
    if (match && match[1]) {
      shopId = match[1];
    }
  }

  if (!shopId) {
    throw new Error(
      'SHOP_ID could not be determined from environment variables',
    );
  }

  // Use direct authorization endpoint (bypassing discovery for now)
  const authorizationEndpoint = `https://shopify.com/authentication/${shopId}/oauth/authorize`;

  // Generate PKCE parameters
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate security parameters
  const state = await generateState();
  const nonce = await generateNonce(16);

  // Store in session
  session.set(SESSION_KEYS.CODE_VERIFIER, codeVerifier);
  session.set(SESSION_KEYS.STATE, state);
  session.set(SESSION_KEYS.NONCE, nonce);

  // Build redirect URI (current origin + callback path)
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/account/authorize/callback`;

  // Build authorization URL
  const authUrl = buildAuthorizationUrl({
    authorizationEndpoint,
    clientId,
    redirectUri,
    state,
    nonce,
    codeChallenge,
  });

  // Commit session and redirect to Shopify login
  return redirect(authUrl, {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  });
}
