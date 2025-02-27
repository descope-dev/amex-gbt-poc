'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);

  useEffect(() => {
    // Get error parameters from URL
    const errorParam = searchParams.get('error');
    const errorDescParam = searchParams.get('error_description');
    
    if (errorParam) {
      setError(errorParam);
      setErrorDescription(errorDescParam);
      console.error(`Authentication Error: ${errorParam} - ${errorDescParam}`);
      
      // Set helpful text based on error type
      if (errorParam === 'session_expired' || errorParam.includes('state')) {
        setHelpText(
          "This error typically occurs when the authentication session has expired or when using a magic link in a different browser than the one where you started the login process. Please try logging in again from the beginning."
        );
      } else if (errorParam === 'missing_code_verifier') {
        setHelpText(
          "This error occurs when the browser can't find the necessary authentication data. This may happen if you opened the magic link in a different browser, cleared your browser data, or if your browser has restrictions on localStorage. Please try logging in again in the same browser."
        );
      } else if (errorParam === 'token_exchange_failed') {
        setHelpText(
          "There was a problem exchanging your authentication code for access tokens. This could be due to an expired code or network issues. Please try logging in again."
        );
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Authentication Error</h1>
        
        {error ? (
          <>
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              {error.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <p className="text-gray-700 mb-4">
              {errorDescription || 'An unknown error occurred during authentication.'}
            </p>
            {helpText && (
              <div className="bg-blue-50 p-4 rounded-md mb-4 text-blue-800 text-sm">
                <h3 className="font-bold mb-1">Troubleshooting Help:</h3>
                <p>{helpText}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-700 mb-4">
            An unknown error occurred during the authentication process.
          </p>
        )}
        
        <div className="flex flex-col space-y-2">
          <Link 
            href="/login" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-center"
          >
            Return to Login
          </Link>
          
          <Link 
            href="/" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 