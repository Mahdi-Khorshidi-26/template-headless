/**
 * Customer Account Page Example
 * Demonstrates how to use Customer Account API
 */
import {type LoaderFunctionArgs, useLoaderData} from 'react-router';
import {
  discoverAPIEndpoints,
  makeCustomerAPIRequest,
} from '~/lib/customer-auth';
import {getAuthenticatedToken} from '~/lib/customer-guards';

interface CustomerData {
  customer: {
    firstName: string;
    lastName: string;
    emailAddress: {
      emailAddress: string;
    };
    orders: {
      edges: Array<{
        node: {
          id: string;
          orderNumber: number;
          totalPrice: {
            amount: string;
            currencyCode: string;
          };
        };
      }>;
    };
  };
}

export async function loader(args: LoaderFunctionArgs) {
  const {context} = args;
  const {env} = context;

  const shopDomain = env.PUBLIC_STORE_DOMAIN;

  if (!shopDomain) {
    throw new Error('PUBLIC_STORE_DOMAIN environment variable not set');
  }

  // Get authenticated access token (auto-refreshes if needed, redirects if invalid)
  const accessToken = await getAuthenticatedToken(args);

  // Discover API endpoints
  const apiConfig = await discoverAPIEndpoints(shopDomain);

  // Fetch customer data
  const response = await makeCustomerAPIRequest<{data: CustomerData}>({
    graphqlEndpoint: apiConfig.graphql_api,
    accessToken,
    query: `
      query GetCustomerProfile {
        customer {
          firstName
          lastName
          emailAddress {
            emailAddress
          }
          orders(first: 5) {
            edges {
              node {
                id
                orderNumber
                totalPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `,
  });

  return {
    customer: response.data.customer,
  };
}

export default function AccountPage() {
  const {customer} = useLoaderData<typeof loader>();

  return (
    <div className="account-page">
      <div className="account-header">
        <h1>My Account</h1>
        <a href="/account/logout" className="logout-button">
          Logout
        </a>
      </div>

      <div className="customer-info">
        <h2>Profile</h2>
        <p>
          <strong>Name:</strong> {customer.firstName} {customer.lastName}
        </p>
        <p>
          <strong>Email:</strong> {customer.emailAddress.emailAddress}
        </p>
      </div>

      <div className="customer-orders">
        <h2>Recent Orders</h2>
        {customer.orders.edges.length > 0 ? (
          <ul>
            {customer.orders.edges.map(({node}) => (
              <li key={node.id}>
                <span>Order #{node.orderNumber}</span>
                <span>
                  {node.totalPrice.amount} {node.totalPrice.currencyCode}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders yet</p>
        )}
      </div>
    </div>
  );
}
