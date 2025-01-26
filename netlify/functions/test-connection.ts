import { createClient } from '@supabase/supabase-js';
import { handleCors, getCorsHeaders } from './utils/cors';
import { createErrorResponse, createSuccessResponse } from './utils/response';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event) => {
  try {
    // Handle CORS
    const corsHeaders = handleCors(event);
    if ('statusCode' in corsHeaders) {
      return corsHeaders;
    }

    // Validate authorization
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        ...createErrorResponse(401, 'Unauthorized'),
        headers: corsHeaders
      };
    }

    // Test database connection
    const { data, error } = await supabase.rpc('test_connection');
    
    if (error) throw error;

    if (!data?.success) {
      throw new Error(data?.error || 'Database connection test failed');
    }

    return {
      ...createSuccessResponse({ success: true, data }),
      headers: corsHeaders
    };

  } catch (error) {
    console.error('Connection test error:', error);
    return {
      ...createErrorResponse(
        500,
        'Database connection test failed',
        process.env.NODE_ENV === 'development' ? error : undefined
      ),
      headers: getCorsHeaders(event)
    };
  }
};