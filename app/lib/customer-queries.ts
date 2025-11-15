/**
 * Customer Account API - Query Examples
 *
 * This file contains common GraphQL queries and mutations
 * for the Customer Account API.
 *
 * Usage:
 * import { CUSTOMER_PROFILE_QUERY } from '~/lib/customer-queries';
 *
 * const data = await makeCustomerAPIRequest({
 *   graphqlEndpoint,
 *   accessToken,
 *   query: CUSTOMER_PROFILE_QUERY,
 * });
 */

// ============================================
// CUSTOMER PROFILE QUERIES
// ============================================

export const CUSTOMER_PROFILE_QUERY = `
  query GetCustomerProfile {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
      }
    }
  }
`;

export const CUSTOMER_BASIC_INFO_QUERY = `
  query GetBasicInfo {
    customer {
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

// ============================================
// ORDER QUERIES
// ============================================

export const CUSTOMER_ORDERS_QUERY = `
  query GetOrders($first: Int = 10, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                  variantTitle
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

export const SINGLE_ORDER_QUERY = `
  query GetOrder($orderId: ID!) {
    order(id: $orderId) {
      id
      orderNumber
      processedAt
      financialStatus
      fulfillmentStatus
      cancelReason
      canceledAt
      totalPrice {
        amount
        currencyCode
      }
      subtotalPrice {
        amount
        currencyCode
      }
      totalShippingPrice {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      shippingAddress {
        address1
        address2
        city
        province
        country
        zip
      }
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            variantTitle
          }
        }
      }
    }
  }
`;

// ============================================
// ADDRESS QUERIES & MUTATIONS
// ============================================

export const CUSTOMER_ADDRESSES_QUERY = `
  query GetAddresses {
    customer {
      addresses(first: 20) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            country
            zip
            firstName
            lastName
            company
            phone
          }
        }
      }
      defaultAddress {
        id
      }
    }
  }
`;

export const CREATE_ADDRESS_MUTATION = `
  mutation CreateAddress($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = `
  mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = `
  mutation DeleteAddress($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
        message
      }
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation SetDefaultAddress($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

// ============================================
// CUSTOMER UPDATE MUTATIONS
// ============================================

export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

// ============================================
// PAYMENT METHODS
// ============================================

export const CUSTOMER_PAYMENT_METHODS_QUERY = `
  query GetPaymentMethods {
    customer {
      paymentMethods(first: 10) {
        edges {
          node {
            id
            instrument {
              ... on CustomerCreditCard {
                brand
                lastDigits
                expiryMonth
                expiryYear
              }
            }
          }
        }
      }
    }
  }
`;

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example: Fetch customer profile
 *
 * const profile = await makeCustomerAPIRequest({
 *   graphqlEndpoint: apiConfig.graphql_api,
 *   accessToken,
 *   query: CUSTOMER_PROFILE_QUERY,
 * });
 */

/**
 * Example: Fetch orders with pagination
 *
 * const orders = await makeCustomerAPIRequest({
 *   graphqlEndpoint: apiConfig.graphql_api,
 *   accessToken,
 *   query: CUSTOMER_ORDERS_QUERY,
 *   variables: {
 *     first: 10,
 *     after: cursor, // from previous query
 *   },
 * });
 */

/**
 * Example: Create new address
 *
 * const result = await makeCustomerAPIRequest({
 *   graphqlEndpoint: apiConfig.graphql_api,
 *   accessToken,
 *   query: CREATE_ADDRESS_MUTATION,
 *   variables: {
 *     address: {
 *       address1: '123 Main St',
 *       city: 'New York',
 *       province: 'NY',
 *       country: 'US',
 *       zip: '10001',
 *       firstName: 'John',
 *       lastName: 'Doe',
 *     },
 *   },
 * });
 *
 * if (result.data.customerAddressCreate.userErrors.length > 0) {
 *   // Handle errors
 * }
 */

/**
 * Example: Update customer profile
 *
 * const result = await makeCustomerAPIRequest({
 *   graphqlEndpoint: apiConfig.graphql_api,
 *   accessToken,
 *   query: UPDATE_CUSTOMER_MUTATION,
 *   variables: {
 *     input: {
 *       firstName: 'Jane',
 *       lastName: 'Smith',
 *     },
 *   },
 * });
 */

/**
 * Example: With French translations using @inContext directive
 *
 * const result = await makeCustomerAPIRequest({
 *   graphqlEndpoint: apiConfig.graphql_api,
 *   accessToken,
 *   query: `
 *     mutation customerAddressUpdate @inContext(language: FR) {
 *       customerAddressUpdate(
 *         address: {phoneNumber: "123456789"},
 *         addressId: "gid://shopify/CustomerAddress/123"
 *       ) {
 *         userErrors {
 *           code
 *           field
 *           message
 *         }
 *       }
 *     }
 *   `,
 * });
 */
