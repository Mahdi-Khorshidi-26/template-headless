/**
 * Extended environment variables for Customer Account API
 */
declare global {
  interface Env {
    /**
     * Customer Account API Client ID
     * Get this from your Shopify admin: Settings > Customer Accounts > Headless
     */
    CUSTOMER_ACCOUNT_CLIENT_ID?: string;

    /**
     * Customer Account API Client Secret (for confidential clients only)
     * Only needed for server-side applications
     */
    CUSTOMER_ACCOUNT_CLIENT_SECRET?: string;

    /**
     * Public store domain (e.g., mystore.myshopify.com)
     */
    PUBLIC_STORE_DOMAIN?: string;
  }
}

export {};
