import { supabase } from '../../lib/supabase/client';
import { useNotificationStore } from '../../lib/store';

export class InfrastructureTester {
  private static instance: InfrastructureTester;

  private constructor() {}

  public static getInstance(): InfrastructureTester {
    if (!InfrastructureTester.instance) {
      InfrastructureTester.instance = new InfrastructureTester();
    }
    return InfrastructureTester.instance;
  }

  async testAll() {
    try {
      const results = {
        database: await this.testDatabaseConnection(),
        rls: await this.testRLSPolicies(),
        auth: await this.testAuthService()
      };

      return results;
    } catch (error) {
      console.error('Test execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
    }
  }

  private async testDatabaseConnection() {
    try {
      const { data, error } = await supabase
        .from('public_data')
        .select('count')
        .limit(1)
        .single();
      
      return {
        success: !error,
        error: error?.message,
        details: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
  }

  private async testRLSPolicies() {
    try {
      const { data, error } = await supabase
        .from('public_data')
        .select('count')
        .limit(1)
        .single();
      
      return {
        success: !error,
        error: error?.message,
        details: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('RLS test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'RLS test failed'
      };
    }
  }

  private async testAuthService() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      return {
        success: true,
        details: {
          hasSession: !!session,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Auth test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Auth service failed'
      };
    }
  }
}

export const infrastructureTester = InfrastructureTester.getInstance();