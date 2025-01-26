import { supabase } from '../../lib/supabase/client';

export class LoadTester {
  private static instance: LoadTester;

  private constructor() {}

  public static getInstance(): LoadTester {
    if (!LoadTester.instance) {
      LoadTester.instance = new LoadTester();
    }
    return LoadTester.instance;
  }

  async testDatabasePerformance(queries = 100) {
    const results = {
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      successRate: 0
    };

    const times: number[] = [];
    let successful = 0;

    for (let i = 0; i < queries; i++) {
      const start = performance.now();
      try {
        await supabase.from('users').select('count').limit(1).single();
        successful++;
        const time = performance.now() - start;
        times.push(time);
      } catch (error) {
        console.error(`Query ${i + 1} failed:`, error);
      }
    }

    if (times.length > 0) {
      results.averageResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
      results.maxResponseTime = Math.max(...times);
      results.minResponseTime = Math.min(...times);
    }
    results.successRate = (successful / queries) * 100;

    return results;
  }

  async testAPIEndpoints(endpoints: string[], requests = 50) {
    const results: Record<string, {
      averageResponseTime: number;
      successRate: number;
      errors: string[];
    }> = {};

    for (const endpoint of endpoints) {
      const times: number[] = [];
      let successful = 0;
      const errors: string[] = [];

      for (let i = 0; i < requests; i++) {
        const start = performance.now();
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            successful++;
            times.push(performance.now() - start);
          } else {
            errors.push(`Request failed with status: ${response.status}`);
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      results[endpoint] = {
        averageResponseTime: times.length > 0 
          ? times.reduce((a, b) => a + b, 0) / times.length 
          : 0,
        successRate: (successful / requests) * 100,
        errors: errors
      };
    }

    return results;
  }

  async testConcurrentConnections(connections = 20) {
    const results = {
      successfulConnections: 0,
      failedConnections: 0,
      averageConnectionTime: 0
    };

    const times: number[] = [];
    const promises = Array(connections).fill(0).map(async () => {
      const start = performance.now();
      try {
        await supabase.auth.getSession();
        times.push(performance.now() - start);
        results.successfulConnections++;
      } catch (error) {
        results.failedConnections++;
        console.error('Connection failed:', error);
      }
    });

    await Promise.all(promises);

    if (times.length > 0) {
      results.averageConnectionTime = times.reduce((a, b) => a + b, 0) / times.length;
    }

    return results;
  }
}

export const loadTester = LoadTester.getInstance();