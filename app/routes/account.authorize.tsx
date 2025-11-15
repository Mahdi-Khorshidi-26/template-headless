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

  const clientId = env.CUSTOMER_ACCOUNT_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'CUSTOMER_ACCOUNT_CLIENT_ID environment variable is not set',
    );
  }

  // Use direct authorization endpoint (bypassing discovery for now)
  const authorizationEndpoint = `https://shopify.com/authentication/${env.SHOP_ID}/oauth/authorize`;

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
