/**
 * Customer Account Logout Route
 * Logs out customer and clears session
 */
import {redirect, type LoaderFunctionArgs} from 'react-router';
import {
  discoverAuthEndpoints,
  buildLogoutUrl,
  SESSION_KEYS,
} from '~/lib/customer-auth';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {session, env} = context;

  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  if (!shopDomain) {
    throw new Error('PUBLIC_STORE_DOMAIN environment variable is not set');
  }

  const idToken = session.get(SESSION_KEYS.ID_TOKEN);

  // Clear all customer session data
  session.unset(SESSION_KEYS.ACCESS_TOKEN);
  session.unset(SESSION_KEYS.REFRESH_TOKEN);
  session.unset(SESSION_KEYS.ID_TOKEN);
  session.unset(SESSION_KEYS.EXPIRES_AT);

  try {
    if (idToken) {
      // Discover logout endpoint
      const authConfig = await discoverAuthEndpoints(shopDomain);

      // Build post-logout redirect URI
      const url = new URL(request.url);
      const postLogoutRedirectUri = `${url.origin}/`;

      // Build logout URL
      const logoutUrl = buildLogoutUrl({
        endSessionEndpoint: authConfig.end_session_endpoint,
        idToken,
        postLogoutRedirectUri,
      });

      // Commit session and redirect to Shopify logout
      return redirect(logoutUrl, {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    }

    // If no ID token, just redirect home
    return redirect('/', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear session and redirect
    return redirect('/', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  }
}
