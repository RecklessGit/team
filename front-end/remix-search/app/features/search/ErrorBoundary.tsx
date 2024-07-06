import { PropsWithChildren, useEffect, useState } from 'react';

export const ErrorBoundary: React.FC<PropsWithChildren> = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
  
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      console.error('Uncaught error:', error);
    };
  
    useEffect(() => {
      const errorListener = (event: ErrorEvent) => {
        event.preventDefault();
        handleError(event.error);
      };
  
      window.addEventListener('error', errorListener);
      return () => {
        window.removeEventListener('error', errorListener);
      };
    }, []);
  
    const handleRefresh = () => {
      window.location.reload();
    };
  
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p>{error?.message}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh the Page
            </button>
          </div>
        </div>
      );
    }
  
    return <>{children}</>;
};
