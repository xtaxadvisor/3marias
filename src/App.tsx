import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { Notifications } from './components/ui/Notifications';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SplashScreen } from './components/ui/SplashScreen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider>
            <AuthProvider>
              <Suspense fallback={<SplashScreen />}>
                <AppRoutes />
              </Suspense>
              <Notifications />
            </AuthProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;