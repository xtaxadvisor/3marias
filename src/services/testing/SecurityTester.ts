import { supabase } from '../../lib/supabase/client';

export class SecurityTester {
  private static instance: SecurityTester;

  private constructor() {}

  public static getInstance(): SecurityTester {
    if (!SecurityTester.instance) {
      SecurityTester.instance = new SecurityTester();
    }
    return SecurityTester.instance;
  }

  async testAuthenticationFlow() {
    const results = {
      success: false,
      issues: [] as string[]
    };

    try {
      // Test sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@protaxadvisors.tax',
        password: 'TestPassword123!'
      });

      if (signUpError) {
        results.issues.push(`Sign up failed: ${signUpError.message}`);
      }

      // Test sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@protaxadvisors.tax',
        password: 'TestPassword123!'
      });

      if (signInError) {
        results.issues.push(`Sign in failed: ${signInError.message}`);
      }

      // Test session management
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        results.issues.push('Session management failed');
      }

      // Clean up test user
      if (signUpData?.user) {
        await supabase.auth.admin.deleteUser(signUpData.user.id);
      }

      results.success = results.issues.length === 0;
    } catch (error) {
      results.issues.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  async testRLS() {
    const results = {
      success: false,
      issues: [] as string[]
    };

    try {
      // Test public access
      const { error: publicError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();

      if (!publicError) {
        results.issues.push('RLS failed: Public access not restricted');
      }

      // Test authenticated access
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error: authError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (authError) {
          results.issues.push(`RLS failed: Authenticated access error - ${authError.message}`);
        }
      }

      results.success = results.issues.length === 0;
    } catch (error) {
      results.issues.push(`RLS test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  async testAPIEndpointSecurity() {
    const endpoints = [
      '/.netlify/functions/admin-auth',
      '/.netlify/functions/openai',
      '/.netlify/functions/send-email'
    ];

    const results = {
      success: false,
      issues: [] as string[]
    };

    for (const endpoint of endpoints) {
      try {
        // Test without auth
        const noAuthResponse = await fetch(endpoint);
        if (noAuthResponse.ok) {
          results.issues.push(`Endpoint ${endpoint} accessible without authentication`);
        }

        // Test with invalid auth
        const invalidAuthResponse = await fetch(endpoint, {
          headers: { Authorization: 'Bearer invalid_token' }
        });
        if (invalidAuthResponse.ok) {
          results.issues.push(`Endpoint ${endpoint} accepts invalid authentication`);
        }
      } catch (error) {
        results.issues.push(`Error testing ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    results.success = results.issues.length === 0;
    return results;
  }
}

export const securityTester = SecurityTester.getInstance();