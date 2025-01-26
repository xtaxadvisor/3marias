import { Handler } from '@netlify/functions';
import { handleCors, getCorsHeaders } from './utils/cors';
import { createErrorResponse, createSuccessResponse } from './utils/response';
import { Configuration, OpenAIApi } from 'openai';

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

    // Test OpenAI configuration
    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    }));

    // Test API connection
    const response = await openai.listModels();
    
    return {
      ...createSuccessResponse({ 
        success: true,
        message: 'OpenAI service connection successful'
      }),
      headers: corsHeaders
    };

  } catch (error) {
    console.error('OpenAI test error:', error);
    return {
      ...createErrorResponse(
        500,
        'OpenAI service test failed',
        process.env.NODE_ENV === 'development' ? error : undefined
      ),
      headers: getCorsHeaders(event)
    };
  }
};