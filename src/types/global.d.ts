
declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      parameters?: {
        [key: string]: any;
      }
    ) => void;
  }
}

export {};
