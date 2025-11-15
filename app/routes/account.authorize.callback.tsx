/**
 * Customer Account Authorization Callback Route
 * Handles OAuth callback and exchanges code for tokens
 */
import {redirect, type LoaderFunctionArgs} from 'react-router';
import {
  discoverAuthEndpoints,
  exchangeCodeForToken,
  getNonce,
  SESSION_KEYS,
  calculateExpiresAt,
} from '~/lib/customer-auth';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {session, env} = context;

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle errors from authorization server
  if (error) {
    console.error('Authorization error:', error);
    return redirect('/account/login?error=' + error);
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('Missing code or state parameter');
    return redirect('/account/login?error=invalid_callback');
  }

  // Verify state to prevent CSRF
  const storedState = session.get(SESSION_KEYS.STATE);
  if (state !== storedState) {
    console.error('State mismatch - possible CSRF attack');
    return redirect('/account/login?error=invalid_state');
  }

  // Get stored PKCE verifier
  const codeVerifier = session.get(SESSION_KEYS.CODE_VERIFIER);
  if (!codeVerifier) {
    console.error('Missing code verifier in session');
    return redirect('/account/login?error=missing_verifier');
  }

  // Get environment variables
  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  const clientId =
    env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || env.CUSTOMER_ACCOUNT_CLIENT_ID;

  if (!shopDomain || !clientId) {
    throw new Error('Required environment variables not set');
  }

  // Get SHOP_ID from env or extract from PUBLIC_CUSTOMER_ACCOUNT_API_URL
  let shopId: string | undefined = env.SHOP_ID;
  if (!shopId && env.PUBLIC_CUSTOMER_ACCOUNT_API_URL) {
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

  try {
    // Use direct token endpoint (bypassing discovery)
    const tokenEndpoint = `https://shopify.com/authentication/${shopId}/oauth/token`;

    // Build redirect URI
    const redirectUri = `${url.origin}/account/authorize/callback`;

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForToken({
      tokenEndpoint,
      clientId,
      redirectUri,
      code,
      codeVerifier,
    });

    // Verify nonce if it was used
    const storedNonce = session.get(SESSION_KEYS.NONCE);
    if (storedNonce) {
      const tokenNonce = getNonce(tokenResponse.id_token);
      if (tokenNonce !== storedNonce) {
        console.error('Nonce mismatch - possible replay attack');
        return redirect('/account/login?error=invalid_nonce');
      }
    }

    // Calculate expiration time
    const expiresAt = calculateExpiresAt(tokenResponse.expires_in);

    // Store tokens in session
    session.set(SESSION_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
    session.set(SESSION_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
    session.set(SESSION_KEYS.ID_TOKEN, tokenResponse.id_token);
    session.set(SESSION_KEYS.EXPIRES_AT, expiresAt);

    // Clean up temporary session data
    session.unset(SESSION_KEYS.CODE_VERIFIER);
    session.unset(SESSION_KEYS.STATE);
    session.unset(SESSION_KEYS.NONCE);

    // Redirect to account page
    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return redirect('/account/login?error=token_exchange_failed');
  }
}
