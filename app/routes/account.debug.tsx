/**
 * Debug Route - Shows Current Configuration
 * Visit: https://your-site.myshopify.dev/account/debug
 */
import {type LoaderFunctionArgs} from 'react-router';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {env} = context;

  const url = new URL(request.url);

  // Get SHOP_ID
  let shopId: string | undefined = env.SHOP_ID;
  if (!shopId && env.PUBLIC_CUSTOMER_ACCOUNT_API_URL) {
    const match = env.PUBLIC_CUSTOMER_ACCOUNT_API_URL.match(/\/(\d+)$/);
    if (match && match[1]) {
      shopId = match[1];
    }
  }

  // Get Client ID
  const clientId =
    env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || env.CUSTOMER_ACCOUNT_CLIENT_ID;

  // Calculate redirect URI (what the code will send)
  const redirectUri = `${url.origin}/account/authorize/callback`;

  return Response.json({
    configuration: {
      deploymentUrl: url.origin,
      shopDomain: env.PUBLIC_STORE_DOMAIN,
      shopId,
      clientId,
      redirectUri,
      authorizationUrl: `https://shopify.com/authentication/${shopId}/oauth/authorize`,
      tokenEndpoint: `https://shopify.com/authentication/${shopId}/oauth/token`,
    },
    instructions: {
      message:
        'Configure this EXACT callback URL in Shopify Application setup:',
      callbackUrl: redirectUri,
      shopifySettingsUrl: 'https://partners.shopify.com/',
      note: 'JavaScript Origin and Logout URL will auto-clear - this is NORMAL for Customer Account API',
    },
    environmentVariables: {
      PUBLIC_STORE_DOMAIN: env.PUBLIC_STORE_DOMAIN || 'NOT SET',
      SHOP_ID: env.SHOP_ID || 'NOT SET (extracting from URL)',
      PUBLIC_CUSTOMER_ACCOUNT_API_URL:
        env.PUBLIC_CUSTOMER_ACCOUNT_API_URL || 'NOT SET',
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:
        env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || 'NOT SET',
      CUSTOMER_ACCOUNT_CLIENT_ID:
        env.CUSTOMER_ACCOUNT_CLIENT_ID || 'NOT SET (local only)',
    },
  });
}

export default function AccountDebug() {
  return (
    <div style={{padding: '2rem', fontFamily: 'monospace'}}>
      <h1>Account Debug</h1>
      <p>Check the JSON response to see your configuration</p>
      <p>
        This route returns JSON - check your browser&apos;s network tab or use
        curl
      </p>
    </div>
  );
}
