// Sentry Error Tracking & Crash Reporting Service
// https://sentry.io - Free tier allows 5,000 errors/month

import * as Sentry from '@sentry/react';

// Sentry DSN should be set in environment variables
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export const initSentry = () => {
    if (!SENTRY_DSN) {
        console.warn('[Sentry] DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,

        // Performance monitoring
        tracesSampleRate: 0.1, // 10% of transactions

        // Session replay (captures user interactions leading to errors)
        replaysSessionSampleRate: 0.0, // Disabled in production
        replaysOnErrorSampleRate: 0.5, // 50% of sessions with errors

        // Release tracking
        release: `ceka@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,

        // Integrations
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Filter out noisy errors
        beforeSend(event) {
            // Don't send chunk loading errors (network issues)
            if (event.message?.includes('ChunkLoadError')) {
                return null;
            }
            return event;
        }
    });

    console.log('[Sentry] Initialized for error tracking');
};

// Utility to capture custom errors
export const captureError = (error: Error, context?: Record<string, unknown>) => {
    if (context) {
        Sentry.setContext('custom', context);
    }
    Sentry.captureException(error);
};

// Utility to log user context (for debugging)
export const setUserContext = (userId: string, email?: string) => {
    Sentry.setUser({
        id: userId,
        email,
    });
};

// Utility to add breadcrumbs
export const addBreadcrumb = (message: string, category: string = 'user-action') => {
    Sentry.addBreadcrumb({
        message,
        category,
        level: 'info',
    });
};

export default Sentry;
