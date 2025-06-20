/**
 * Generates a Stripe Connect OAuth URL with optimized parameters
 * @param url - The callback URL path
 * @param data - User ID to pass as state parameter
 * @param prefill - Whether to prefill test data for development
 */
export const getStripeOAuthLink = (url: string, data: string, prefill: boolean = false) => {
  const baseUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/${url}&state=${data}`;
  
  // In development, you can prefill test data to speed up the process
  if (prefill && process.env.NODE_ENV === 'development') {
    const prefillParams = new URLSearchParams({
      'stripe_user[business_type]': 'individual',
      'stripe_user[business_name]': 'Test Business',
      'stripe_user[first_name]': 'Test',
      'stripe_user[last_name]': 'User',
      'stripe_user[email]': 'test@example.com',
      'stripe_user[url]': 'https://example.com',
      'stripe_user[country]': 'US',
    });
    
    return `${baseUrl}&${prefillParams.toString()}`;
  }
  
  return baseUrl;
};

/**
 * Alternative Express onboarding link (faster setup for some users)
 * This can be used as an alternative to the standard Connect flow
 */
export const getStripeExpressLink = (userId: string) => {
  return `https://connect.stripe.com/express/oauth/authorize?redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe-connect&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&state=${userId}&stripe_user[email]=${encodeURIComponent('')}`;
};

/**
 * Generates pre-configured test data for Stripe Connect in development
 * This helps developers quickly test the integration
 */
export const getTestAccountData = () => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Test account data is only available in development mode');
  }
  
  return {
    business_type: 'individual',
    individual: {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      dob: {
        day: 1,
        month: 1,
        year: 1990,
      },
      address: {
        line1: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        postal_code: '12345',
        country: 'US',
      },
      ssn_last_4: '0000',
    },
    business_profile: {
      url: 'https://example.com',
      mcc: '5734', // Computer software stores
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: '192.168.1.1',
    },
  };
};
