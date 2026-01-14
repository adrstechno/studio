import { NextRequest, NextResponse } from 'next/server';

// This endpoint creates a single Firebase user
// Note: In production, use Firebase Admin SDK server-side
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, displayName } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Return success with instructions
        // The actual Firebase user creation will be done client-side
        return NextResponse.json({
            success: true,
            email,
            displayName,
            message: 'User data prepared for Firebase creation',
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error preparing Firebase user:', error);
        return NextResponse.json({ 
            error: error.message || 'Failed to prepare user data' 
        }, { status: 500 });
    }
}
