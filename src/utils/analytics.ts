
// Analytics utility for tracking events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // For now, just log the event. In production, this would integrate with analytics services
  console.log('Analytics Event:', eventName, properties);
  
  // You can integrate with services like Google Analytics, Mixpanel, etc. here
  // Example: gtag('event', eventName, properties);
};
