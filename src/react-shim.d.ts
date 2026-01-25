/// <reference types="react" />
/// <reference types="react-dom" />

// Force TypeScript to recognize React types
declare module 'react' {
    export * from '@types/react';
}

declare module 'react-dom' {
    export * from '@types/react-dom';
}

declare module 'react-dom/client' {
    export * from '@types/react-dom/client';
}

// Ensure JSX namespace is available globally
import React = require('react');
export = React;
export as namespace React;
