import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Parse the token data from the request body
        const data = await request.json();
        const { access_token, id_token, refresh_token, expires_in } = data;

        // Validate that we received the expected tokens
        if (!access_token || !id_token) {
            console.error('Missing required tokens in request');
            return NextResponse.json(
                { error: 'invalid_request', error_description: 'Missing required tokens' },
                { status: 400 }
            );
        }

        // Set cookies with the tokens
        cookies().set('id_token', id_token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'lax',
            maxAge: expires_in ? parseInt(expires_in) : 3600 // Default to 1 hour if expires_in is not provided
        });
        
        cookies().set('access_token', access_token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'lax',
            maxAge: expires_in ? parseInt(expires_in) : 3600
        });
        
        if (refresh_token) {
            cookies().set('refresh_token', refresh_token, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'lax',
                // Refresh tokens typically have a longer lifetime
                maxAge: 30 * 24 * 60 * 60 // 30 days
            });
        }
        
        if (expires_in) {
            cookies().set('expires_in', expires_in.toString(), { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'lax',
                maxAge: parseInt(expires_in)
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error storing tokens:', error);
        return NextResponse.json(
            { error: 'server_error', error_description: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 