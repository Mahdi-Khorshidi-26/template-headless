/**
 * Setup Helper Page
 * Shows exact configuration needed for Shopify Admin
 */
import {type LoaderFunctionArgs} from 'react-router';

export async function loader({request, context}: LoaderFunctionArgs) {
  const {env} = context;
  const url = new URL(request.url);

  return {
    currentOrigin: url.origin,
    callbackUri: `${url.origin}/account/authorize/callback`,
    logoutUri: url.origin,
    shopDomain: env.PUBLIC_STORE_DOMAIN,
    clientId: env.CUSTOMER_ACCOUNT_CLIENT_ID,
  };
}

export default function SetupHelper() {
  const data = useLoaderData<typeof loader>();

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '50px auto',
        padding: '20px',
        fontFamily: 'system-ui',
      }}
    >
      <h1>🔧 Customer Account API Setup</h1>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '30px',
        }}
      >
        <h2 style={{marginTop: 0}}>⚠️ Configuration Required</h2>
        <p>
          Follow these steps to configure your Shopify store for Customer
          Account API:
        </p>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Step 1: Open Shopify Admin</h3>
        <p>Go to:</p>
        <a
          href={`https://${data.shopDomain}/admin/settings/customer_accounts`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#5c6ac4',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginTop: '10px',
          }}
        >
          Open Customer Accounts Settings →
        </a>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Step 2: Find Headless Section</h3>
        <ol>
          <li>
            Scroll down to the <strong>&quot;Headless&quot;</strong> section
          </li>
          <li>
            Click <strong>&quot;Set up&quot;</strong> or{' '}
            <strong>&quot;Manage&quot;</strong>
          </li>
        </ol>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          border: '2px solid #28a745',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Step 3: Add These Exact Values</h3>

        <div style={{marginBottom: '20px'}}>
          <h4>📍 Callback URI (Redirect URI)</h4>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
            Copy and paste this EXACTLY (including the port number):
          </p>
          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <code>{data.callbackUri}</code>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(data.callbackUri);
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{marginBottom: '20px'}}>
          <h4>🌐 JavaScript Origin (CORS)</h4>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
            Copy and paste this EXACTLY:
          </p>
          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <code>{data.currentOrigin}</code>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(data.currentOrigin);
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{marginBottom: '20px'}}>
          <h4>🚪 Logout URI</h4>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
            Copy and paste this EXACTLY:
          </p>
          <div
            style={{
              padding: '15px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <code>{data.logoutUri}</code>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(data.logoutUri);
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Step 4: Save and Verify</h3>
        <ol>
          <li>
            Click <strong>Save</strong> in Shopify Admin
          </li>
          <li>
            Copy your <strong>Client ID</strong> if it changed
          </li>
          <li>Come back here and test the login</li>
        </ol>
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>📋 Current Configuration</h3>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <tbody>
            <tr style={{borderBottom: '1px solid #ddd'}}>
              <td style={{padding: '10px', fontWeight: 'bold'}}>
                Shop Domain:
              </td>
              <td style={{padding: '10px', fontFamily: 'monospace'}}>
                {data.shopDomain}
              </td>
            </tr>
            <tr style={{borderBottom: '1px solid #ddd'}}>
              <td style={{padding: '10px', fontWeight: 'bold'}}>Client ID:</td>
              <td style={{padding: '10px', fontFamily: 'monospace'}}>
                {data.clientId}
              </td>
            </tr>
            <tr style={{borderBottom: '1px solid #ddd'}}>
              <td style={{padding: '10px', fontWeight: 'bold'}}>
                Current Server:
              </td>
              <td style={{padding: '10px', fontFamily: 'monospace'}}>
                {data.currentOrigin}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{textAlign: 'center', marginTop: '40px'}}>
        <h3>✅ Ready to Test?</h3>
        <p>After saving the configuration in Shopify Admin, click below:</p>
        <a
          href="/account/login"
          style={{
            display: 'inline-block',
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            marginTop: '10px',
          }}
        >
          Test Login →
        </a>
      </div>

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#f1f3f5',
          borderLeft: '4px solid #868e96',
          borderRadius: '4px',
        }}
      >
        <h4>💡 Troubleshooting Tips</h4>
        <ul>
          <li>
            Make sure to include the <strong>exact port number</strong> (:
            {data.currentOrigin.split(':')[2]})
          </li>
          <li>Don&apos;t add trailing slashes to the URIs</li>
          <li>
            Protocol must be <code>http://</code> for localhost
          </li>
          <li>After saving, it may take a few seconds to apply</li>
          <li>Clear your browser cookies if you still see errors</li>
        </ul>
      </div>
    </div>
  );
}

// Add missing import
import {useLoaderData} from 'react-router';
