import { client_id, API_URL } from "@/app/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    // Handle error cases
    if (error) {
        console.error(`OIDC Error: ${error} - ${error_description}`);
        
        // Redirect to error page with error information
        return new Response(null, {
            status: 302,
            headers: {
                'Location': `/error-page?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || '')}`,
            }
        });
    }

    // Validate required parameters
    if (!code) {
        console.error('Missing required parameter: code');
        return new Response(null, {
            status: 302,
            headers: {
                'Location': '/error-page?error=invalid_request&error_description=Missing+required+parameter:+code',
            }
        });
    }

    // For state validation issues, we'll use a client-side redirect approach
    // This allows us to access localStorage to get the stored code verifier
    // Create an HTML page that will handle the token exchange on the client side
    return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
            <title>Processing Authentication...</title>
            <script>
                // Function to handle the token exchange
                async function handleTokenExchange() {
                    try {
                        // Get the code from URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const code = urlParams.get('code');
                        
                        // Get the stored code verifier from localStorage
                        const codeVerifier = localStorage.getItem('oidc_code_verifier');
                        
                        // Log for debugging
                        console.log('Code:', code);
                        console.log('Code Verifier:', codeVerifier);
                        
                        // Check if we have the code verifier
                        if (!codeVerifier) {
                            console.error('Code verifier not found');
                            window.location.href = '/error-page?error=missing_code_verifier&error_description=Code+verifier+not+found+in+storage.+This+may+happen+if+you+opened+the+magic+link+in+a+different+browser+or+cleared+your+browser+data.';
                            return;
                        }
                        
                        // Construct the base URL for Descope API
                        let baseURL = "api.descope.com";
                        const projectId = "${process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID}";
                        if (projectId && projectId.length >= 32) {
                            const localURL = projectId.substring(1, 5);
                            baseURL = [baseURL.slice(0, 4), localURL, ".", baseURL.slice(4)].join('');
                        }
                        
                        // Set up the token exchange request
                        const tokenUrl = \`https://\${baseURL}/oauth2/v1/token\`;
                        const tokenData = {
                            grant_type: 'authorization_code',
                            code: code,
                            client_id: "${client_id}",
                            code_verifier: codeVerifier,
                            redirect_uri: "${API_URL}/api/auth/callback"
                        };
                        
                        console.log('Token request data:', JSON.stringify(tokenData));
                        
                        // Make the token exchange request
                        const response = await fetch(tokenUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(tokenData)
                        });
                        
                        // Handle response
                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error('Token exchange failed:', errorData);
                            window.location.href = \`/error-page?error=token_exchange_failed&error_description=\${encodeURIComponent(errorData.error_description || 'Failed to exchange authorization code for tokens')}\`;
                            return;
                        }
                        
                        // Process successful response
                        const data = await response.json();
                        console.log('Token exchange successful');
                        
                        // Store tokens in cookies via a server endpoint
                        const storeResponse = await fetch('/api/auth/store-tokens', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        });
                        
                        if (storeResponse.ok) {
                            // Clean up localStorage
                            localStorage.removeItem('oidc_code_verifier');
                            localStorage.removeItem('oidc_timestamp');
                            localStorage.removeItem('oidc_state');
                            
                            // Redirect to dashboard
                            window.location.href = '/dashboard';
                        } else {
                            window.location.href = '/error-page?error=token_storage_failed&error_description=Failed+to+store+authentication+tokens';
                        }
                    } catch (error) {
                        console.error('Error during token exchange:', error);
                        window.location.href = '/error-page?error=server_error&error_description=An+unexpected+error+occurred';
                    }
                }
                
                // Execute the token exchange when the page loads
                window.onload = handleTokenExchange;
            </script>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f5f5f5;
                }
                .loader {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .container {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="loader"></div>
                <h2>Processing your authentication...</h2>
                <p>Please wait while we complete the sign-in process.</p>
            </div>
        </body>
        </html>`,
        {
            status: 200,
            headers: {
                'Content-Type': 'text/html',
            },
        }
    );
}


