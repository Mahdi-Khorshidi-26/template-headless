/**
 * Customer Account API Authentication Utilities
 * Implements OAuth 2.0 + PKCE flow for public clients
 * Based on Shopify Customer Account API documentation
 */

/**
 * OpenID Configuration Response
 */
export interface OpenIDConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  issuer: string;
}

/**
 * Customer Account API Configuration Response
 */
export interface CustomerAccountAPIConfig {
  graphql_api: string;
  mcp_api: string;
}

/**
 * Access Token Response
 */
export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
}

/**
 * Decoded JWT Token
 */
export interface DecodedJWT {
  header: Record<string, any>;
  payload: {
    nonce?: string;
    [key: string]: any;
  };
  signature: string;
}

/**
 * Discover OpenID Configuration
 * Fetches authentication endpoints from the shop's storefront domain
 */
export async function discoverAuthEndpoints(
  shopDomain: string,
): Promise<OpenIDConfiguration> {
  const discoveryUrl = `https://${shopDomain}/.well-known/openid-configuration`;
  const response = await fetch(discoveryUrl, {
    headers: {
      'User-Agent': 'Hydrogen Storefront',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Discovery endpoint error:', {
      status: response.status,
      statusText: response.statusText,
      url: discoveryUrl,
      response: errorText,
    });
    throw new Error(
      `Failed to discover auth endpoints: ${response.statusText} (${response.status}). This may indicate that Customer Accounts are not enabled or properly configured in your Shopify store.`,
    );
  }

  return response.json() as Promise<OpenIDConfiguration>;
}

/**
 * Discover Customer Account API Endpoints
 * Fetches GraphQL and MCP API endpoints with version already included
 */
export async function discoverAPIEndpoints(
  shopDomain: string,
): Promise<CustomerAccountAPIConfig> {
  const apiDiscoveryUrl = `https://${shopDomain}/.well-known/customer-account-api`;
  const response = await fetch(apiDiscoveryUrl, {
    headers: {
      'User-Agent': 'Hydrogen Storefront',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API discovery endpoint error:', {
      status: response.status,
      statusText: response.statusText,
      url: apiDiscoveryUrl,
      response: errorText,
    });
    throw new Error(
      `Failed to discover API endpoints: ${response.statusText} (${response.status})`,
    );
  }

  return response.json() as Promise<CustomerAccountAPIConfig>;
}

/**
 * Generate a cryptographically secure random code verifier
 * Used for PKCE flow in public clients
 */
export async function generateCodeVerifier(): Promise<string> {
  const randomCode = generateRandomCode();
  return base64UrlEncode(randomCode);
}

/**
 * Generate code challenge from verifier using SHA-256
 * Used for PKCE flow in public clients
 */
export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const digestOp = await crypto.subtle.digest(
    {name: 'SHA-256'},
    new TextEncoder().encode(codeVerifier),
  );
  const hash = convertBufferToString(digestOp);
  return base64UrlEncode(hash);
}

/**
 * Generate a random state parameter to prevent CSRF attacks
 */
export async function generateState(): Promise<string> {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return timestamp + randomString;
}

/**
 * Generate a nonce to prevent replay attacks
 */
export async function generateNonce(length: number = 16): Promise<string> {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters.charAt(randomIndex);
  }

  return nonce;
}

/**
 * Build authorization URL for OAuth flow
 * Redirects customer to login page
 */
export interface AuthorizationRequestParams {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  nonce?: string;
  codeChallenge: string;
  locale?: string;
  prompt?: 'none';
}

export function buildAuthorizationUrl(
  params: AuthorizationRequestParams,
): string {
  const {
    authorizationEndpoint,
    clientId,
    redirectUri,
    state,
    nonce,
    codeChallenge,
    locale,
    prompt,
  } = params;

  const url = new URL(authorizationEndpoint);

  url.searchParams.append('scope', 'openid email customer-account-api:full');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', 'S256');

  if (nonce) {
    url.searchParams.append('nonce', nonce);
  }

  if (locale) {
    url.searchParams.append('locale', locale);
  }

  if (prompt) {
    url.searchParams.append('prompt', prompt);
  }

  return url.toString();
}

/**
 * Exchange authorization code for access token
 * Public client version (requires code_verifier)
 */
export interface TokenRequestParams {
  tokenEndpoint: string;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}

export async function exchangeCodeForToken(
  params: TokenRequestParams,
): Promise<AccessTokenResponse> {
  const {tokenEndpoint, clientId, redirectUri, code, codeVerifier} = params;

  const body = new URLSearchParams();
  body.append('grant_type', 'authorization_code');
  body.append('client_id', clientId);
  body.append('redirect_uri', redirectUri);
  body.append('code', code);
  body.append('code_verifier', codeVerifier);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Hydrogen Storefront',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<AccessTokenResponse>;
}

/**
 * Refresh an expired access token
 */
export interface RefreshTokenParams {
  tokenEndpoint: string;
  clientId: string;
  refreshToken: string;
}

export async function refreshAccessToken(
  params: RefreshTokenParams,
): Promise<Omit<AccessTokenResponse, 'id_token'>> {
  const {tokenEndpoint, clientId, refreshToken} = params;

  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('client_id', clientId);
  body.append('refresh_token', refreshToken);

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Hydrogen Storefront',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<Omit<AccessTokenResponse, 'id_token'>>;
}

/**
 * Build logout URL
 */
export interface LogoutParams {
  endSessionEndpoint: string;
  idToken: string;
  postLogoutRedirectUri: string;
}

export function buildLogoutUrl(params: LogoutParams): string {
  const {endSessionEndpoint, idToken, postLogoutRedirectUri} = params;

  const url = new URL(endSessionEndpoint);
  url.searchParams.append('id_token_hint', idToken);
  url.searchParams.append('post_logout_redirect_uri', postLogoutRedirectUri);

  return url.toString();
}

/**
 * Decode JWT token without verification
 * Use for extracting nonce and other claims
 */
export function decodeJwt(token: string): DecodedJWT {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    throw new Error('Invalid JWT token format');
  }

  const decodedHeader = JSON.parse(atob(header)) as Record<string, any>;
  const decodedPayload = JSON.parse(atob(payload)) as {
    nonce?: string;
    [key: string]: any;
  };

  return {
    header: decodedHeader,
    payload: decodedPayload,
    signature,
  };
}

/**
 * Extract nonce from ID token
 */
export function getNonce(idToken: string): string | undefined {
  return decodeJwt(idToken).payload.nonce;
}

/**
 * Make authenticated request to Customer Account API
 */
export interface CustomerAPIRequestParams {
  graphqlEndpoint: string;
  accessToken: string;
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export async function makeCustomerAPIRequest<T = any>(
  params: CustomerAPIRequestParams,
): Promise<T> {
  const {graphqlEndpoint, accessToken, query, variables, operationName} =
    params;

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({
      query,
      variables: variables || {},
      operationName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Customer API request failed: ${response.status} - ${errorText}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Helper Functions
 */

function generateRandomCode(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return String.fromCharCode.apply(null, Array.from(array));
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  // Remove padding and make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function convertBufferToString(hash: ArrayBuffer): string {
  const uintArray = new Uint8Array(hash);
  const numberArray = Array.from(uintArray);
  return String.fromCharCode(...numberArray);
}

/**
 * Session Storage Keys
 */
export const SESSION_KEYS = {
  CODE_VERIFIER: 'customer_code_verifier',
  STATE: 'customer_state',
  NONCE: 'customer_nonce',
  ACCESS_TOKEN: 'customer_access_token',
  REFRESH_TOKEN: 'customer_refresh_token',
  ID_TOKEN: 'customer_id_token',
  EXPIRES_AT: 'customer_expires_at',
} as const;

/**
 * Check if access token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Calculate expiration timestamp
 */
export function calculateExpiresAt(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}
