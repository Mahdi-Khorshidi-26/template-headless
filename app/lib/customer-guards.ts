/**
 * Customer Authentication Guards
 * Utilities for protecting routes and managing authentication state
 */
import {redirect, type LoaderFunctionArgs} from 'react-router';
import {isCustomerAuthenticated, getValidAccessToken} from './customer-session';

/**
 * Require customer authentication
 * Throws redirect to login if not authenticated
 *
 * @example
 * ```tsx
 * export async function loader(args: LoaderFunctionArgs) {
 *   requireCustomerAuth(args);
 *   // Route is now protected
 * }
 * ```
 */
export function requireCustomerAuth(args: LoaderFunctionArgs): void {
  const {session} = args.context;

  if (!isCustomerAuthenticated(session)) {
    throw redirect('/account/authorize');
  }
}

/**
 * Get authenticated access token
 * Auto-refreshes if expired, redirects to login if refresh fails
 *
 * @example
 * ```tsx
 * export async function loader(args: LoaderFunctionArgs) {
 *   const accessToken = await getAuthenticatedToken(args);
 *   // Use accessToken for API requests
 * }
 * ```
 */
export async function getAuthenticatedToken(
  args: LoaderFunctionArgs,
): Promise<string> {
  const {session, env} = args.context;

  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  const clientId = env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || env.CUSTOMER_ACCOUNT_CLIENT_ID;

  if (!shopDomain || !clientId) {
    throw new Error(
      'PUBLIC_STORE_DOMAIN and CUSTOMER_ACCOUNT_CLIENT_ID must be set',
    );
  }

  const accessToken = await getValidAccessToken(session, shopDomain, clientId);

  if (!accessToken) {
    throw redirect('/account/authorize');
  }

  return accessToken;
}

/**
 * Optional authentication
 * Returns null if not authenticated, does not redirect
 * Useful for pages that can work with or without authentication
 *
 * @example
 * ```tsx
 * export async function loader(args: LoaderFunctionArgs) {
 *   const accessToken = await optionalAuth(args);
 *   if (accessToken) {
 *     // Load personalized content
 *   } else {
 *     // Load public content
 *   }
 * }
 * ```
 */
export async function optionalAuth(
  args: LoaderFunctionArgs,
): Promise<string | null> {
  const {session, env} = args.context;

  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  const clientId = env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || env.CUSTOMER_ACCOUNT_CLIENT_ID;

  if (!shopDomain || !clientId) {
    return null;
  }

  if (!isCustomerAuthenticated(session)) {
    return null;
  }

  try {
    return await getValidAccessToken(session, shopDomain, clientId);
  } catch {
    return null;
  }
}

/**
 * Redirect if already authenticated
 * Useful for login/register pages
 *
 * @example
 * ```tsx
 * export async function loader(args: LoaderFunctionArgs) {
 *   redirectIfAuthenticated(args, '/account');
 *   // Show login page
 * }
 * ```
 */
export function redirectIfAuthenticated(
  args: LoaderFunctionArgs,
  destination: string = '/account',
): void {
  const {session} = args.context;

  if (isCustomerAuthenticated(session)) {
    throw redirect(destination);
  }
}
