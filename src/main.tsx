import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './components/providers/AppProviders.tsx';
import './index.css';
import posthog from 'posthog-js';

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_ph5K7sEtEe7ma5owE6AdhcKR4TdBwqSjM94ddi6Pcrhx', {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  person_profiles: 'always', // Track both anonymous visitors and logged in users
  capture_pageview: true,
  autocapture: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);