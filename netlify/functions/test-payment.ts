import { Handler } from '@netlify/functions';
import { handleCors, getCorsHeaders } from './utils/cors';
import { createErrorResponse, createSuccessResponse } from './utils/response';

export const handler: Handler = async (event) => {
  try {
    // Handle CORS
    const corsHeaders = handleCors(event);
    if ('statusCode' in corsHeaders) {
      return corsHeaders;
    }

    // Validate request method
    if (event.httpMethod !== 'POST') {
      return {
        ...createErrorResponse(405, 'Method not allowed'),
        headers: corsHeaders
      };
    }

    // Validate authorization
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        ...createErrorResponse(401, 'Unauthorized'),
        headers: corsHeaders
      };
    }

    // Test Stripe configuration
    const STRIPE_CONFIG = {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    };

    // Validate configuration
    if (!STRIPE_CONFIG.secretKey || !STRIPE_CONFIG.publicKey || !STRIPE_CONFIG.webhookSecret) {
      throw new Error('Payment service not properly configured');
    }

    // Return success if configuration is valid
    return {
      ...createSuccessResponse({ 
        success: true,
        message: 'Payment service configuration valid',
        config: {
          publicKey: STRIPE_CONFIG.publicKey
        }
      }),
      headers: corsHeaders
    };

  } catch (error) {
    console.error('Payment test error:', error);
    return {
      ...createErrorResponse(
        500,
        'Payment service test failed',
        process.env.NODE_ENV === 'development' ? error : undefined
      ),
      headers: getCorsHeaders(event)
    };
  }
};