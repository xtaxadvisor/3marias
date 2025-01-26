import { infrastructureTester } from './InfrastructureTester';
import { loadTester } from './LoadTester';
import { securityTester } from './SecurityTester';

export async function runAllTests() {
  try {
    const results = {
      infrastructure: await infrastructureTester.testAll(),
      load: {
        database: await loadTester.testDatabasePerformance(),
        api: await loadTester.testAPIEndpoints([
          '/.netlify/functions/openai',
          '/.netlify/functions/send-email',
          '/.netlify/functions/admin-auth'
        ])
      },
      security: {
        auth: await securityTester.testAuthenticationFlow(),
        rls: await securityTester.testRLS(),
        api: await securityTester.testAPIEndpointSecurity()
      }
    };

    return results;
  } catch (error) {
    console.error('Test execution failed:', error);
    throw error;
  }
}

export { infrastructureTester, loadTester, securityTester };