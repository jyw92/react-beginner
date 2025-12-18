import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router';
import './index.css';
import App from './App.tsx';
import {Toaster} from 'sonner';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Ssgoi} from '@ssgoi/react';
import {fade} from '@ssgoi/react/view-transitions';

const config = {
  defaultTransition: fade(),
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <Ssgoi config={config}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-center" />
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </Ssgoi>
);
