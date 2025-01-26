import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { handleCors, getCorsHeaders } from './utils/cors';
import { createErrorResponse, createSuccessResponse } from './utils/response';

export const handler = async (event) => {
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

    // Configure AWS SES
    const ses = new SESClient({
      region: process.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: process.env.VITE_AWS_SMTP_USERNAME,
        secretAccessKey: process.env.VITE_AWS_SMTP_PASSWORD
      }
    });

    // Test SES configuration
    const command = new SendEmailCommand({
      Source: process.env.VITE_AWS_SMTP_FROM,
      Destination: {
        ToAddresses: [process.env.VITE_AWS_SMTP_FROM]
      },
      Message: {
        Subject: { Data: 'Test Email' },
        Body: { Text: { Data: 'This is a test email.' } }
      }
    });

    await ses.send(command);

    return {
      ...createSuccessResponse({ 
        success: true,
        message: 'Email service configuration valid'
      }),
      headers: corsHeaders
    };

  } catch (error) {
    console.error('Email test error:', error);
    return {
      ...createErrorResponse(
        500,
        'Email service test failed',
        process.env.NODE_ENV === 'development' ? error : undefined
      ),
      headers: getCorsHeaders(event)
    };
  }
};