/**
 * Customer Session Helper
 * Provides utilities for managing customer authentication state
 */
import type {HydrogenSession} from '@shopify/hydrogen';
import {
  SESSION_KEYS,
  isTokenExpired,
  refreshAccessToken,
  discoverAuthEndpoints,
  type AccessTokenResponse,
} from './customer-auth';

export interface CustomerTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

/**
 * Get customer tokens from session
 */
export function getCustomerTokens(
  session: HydrogenSession,
): CustomerTokens | null {
  const accessToken = session.get(SESSION_KEYS.ACCESS_TOKEN);
  const refreshToken = session.get(SESSION_KEYS.REFRESH_TOKEN);
  const idToken = session.get(SESSION_KEYS.ID_TOKEN);
  const expiresAt = session.get(SESSION_KEYS.EXPIRES_AT);

  if (!accessToken || !refreshToken || !idToken || !expiresAt) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    idToken,
    expiresAt,
  };
}

/**
 * Check if customer is authenticated
 */
export function isCustomerAuthenticated(session: HydrogenSession): boolean {
  const tokens = getCustomerTokens(session);
  if (!tokens) return false;

  // Check if token is expired
  return !isTokenExpired(tokens.expiresAt);
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
  session: HydrogenSession,
  shopDomain: string,
  clientId: string,
): Promise<string | null> {
  const tokens = getCustomerTokens(session);
  if (!tokens) return null;

  // If token is not expired, return it
  if (!isTokenExpired(tokens.expiresAt)) {
    return tokens.accessToken;
  }

  // Token is expired, try to refresh
  try {
    const authConfig = await discoverAuthEndpoints(shopDomain);

    const newTokens = await refreshAccessToken({
      tokenEndpoint: authConfig.token_endpoint,
      clientId,
      refreshToken: tokens.refreshToken,
    });

    // Update session with new tokens
    session.set(SESSION_KEYS.ACCESS_TOKEN, newTokens.access_token);
    session.set(SESSION_KEYS.REFRESH_TOKEN, newTokens.refresh_token);
    session.set(
      SESSION_KEYS.EXPIRES_AT,
      Date.now() + newTokens.expires_in * 1000,
    );

    return newTokens.access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    // Clear invalid tokens
    clearCustomerSession(session);
    return null;
  }
}

/**
 * Clear customer session data
 */
export function clearCustomerSession(session: HydrogenSession): void {
  session.unset(SESSION_KEYS.ACCESS_TOKEN);
  session.unset(SESSION_KEYS.REFRESH_TOKEN);
  session.unset(SESSION_KEYS.ID_TOKEN);
  session.unset(SESSION_KEYS.EXPIRES_AT);
  session.unset(SESSION_KEYS.CODE_VERIFIER);
  session.unset(SESSION_KEYS.STATE);
  session.unset(SESSION_KEYS.NONCE);
}

/**
 * Store customer tokens in session
 */
export function storeCustomerTokens(
  session: HydrogenSession,
  tokens: AccessTokenResponse,
): void {
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  session.set(SESSION_KEYS.ACCESS_TOKEN, tokens.access_token);
  session.set(SESSION_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  session.set(SESSION_KEYS.ID_TOKEN, tokens.id_token);
  session.set(SESSION_KEYS.EXPIRES_AT, expiresAt);
}
