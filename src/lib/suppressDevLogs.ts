// Suppress noisy development logs for known non-critical issues
export const suppressDevLogs = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress ICE candidate errors (these are common in development)
      if (
        message.includes('ICE Candidate error 701') ||
        message.includes('STUN host lookup received error') ||
        message.includes('TURN host lookup received error') ||
        message.includes('Address not associated with the desired network interface')
      ) {
        return;
      }
      
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Allow the connectUser warning but only show it once
      if (message.includes('Consecutive calls to connectUser')) {
        if (!window.__connectUserWarningShown) {
          window.__connectUserWarningShown = true;
          originalConsoleWarn.apply(console, args);
        }
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };

    // Global error handler for ICE candidate errors
    window.addEventListener('error', (event) => {
      if (
        event.message?.includes('ICE') ||
        event.message?.includes('STUN') ||
        event.message?.includes('TURN')
      ) {
        event.preventDefault(); // Prevent the error from being logged
      }
    });
  }
};

// Add type declaration for window property
declare global {
  interface Window {
    __connectUserWarningShown?: boolean;
  }
} 