/**
 * Account Login Page
 * Shows login button and helpful error messages
 */
import {type LoaderFunctionArgs, useLoaderData} from 'react-router';
import {isCustomerAuthenticated} from '~/lib/customer-session';

export async function loader({context, request}: LoaderFunctionArgs) {
  const {session} = context;
  const url = new URL(request.url);
  const error = url.searchParams.get('error');

  // If already authenticated, redirect to account
  if (isCustomerAuthenticated(session)) {
    return Response.redirect('/account', 302);
  }

  return {
    error,
  };
}

export default function AccountLogin() {
  const {error} = useLoaderData<typeof loader>();

  return (
    <div style={{maxWidth: '600px', margin: '50px auto', padding: '20px'}}>
      <h1>Customer Login</h1>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong>{' '}
          {error === 'invalid_callback' && 'Invalid authorization callback'}
          {error === 'invalid_state' &&
            'Invalid state parameter (CSRF detected)'}
          {error === 'missing_verifier' && 'Missing code verifier'}
          {error === 'invalid_nonce' &&
            'Invalid nonce (possible replay attack)'}
          {error === 'token_exchange_failed' &&
            'Failed to exchange authorization code'}
          {error === 'login_required' && 'Please log in to continue'}
        </div>
      )}

      <p>
        Log in to your account to view orders, manage addresses, and update your
        profile.
      </p>

      <a
        href="/account/authorize"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#000',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          marginTop: '20px',
        }}
      >
        Login with Shopify
      </a>

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h3>⚠️ Setup Required</h3>
        <p>
          If you&apos;re seeing errors, Customer Accounts may not be properly
          configured:
        </p>
        <ol>
          <li>
            Go to Shopify Admin → <strong>Settings</strong> →{' '}
            <strong>Customer Accounts</strong>
          </li>
          <li>
            Enable <strong>Headless</strong> customer accounts
          </li>
          <li>
            Add callback URL:{' '}
            <code>http://localhost:3001/account/authorize/callback</code>
          </li>
          <li>
            Copy your <strong>Client ID</strong> to the <code>.env</code> file
          </li>
          <li>
            Make sure <code>CUSTOMER_ACCOUNT_CLIENT_ID</code> is set
          </li>
        </ol>
      </div>
    </div>
  );
}
