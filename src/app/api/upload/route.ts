import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
    try {
        // Validate environment variables first
        const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error('Missing Cloudinary environment variables:', missingVars);
            return NextResponse.json(
                { error: 'Server configuration error', code: 'MISSING_CONFIG' },
                { status: 500 }
            );
        }

        // Configure Cloudinary with explicit values
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided', code: 'NO_FILE' },
                { status: 400 }
            );
        }

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.', code: 'INVALID_TYPE' },
                { status: 400 }
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.', code: 'FILE_TOO_LARGE' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary with timeout
        const result = await Promise.race([
            cloudinary.uploader.upload(dataURI, {
                folder: 'adrs-employees',
                resource_type: 'auto',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', quality: 'auto' }
                ]
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Upload timeout')), 30000)
            )
        ]) as any;

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
        });

    } catch (error: any) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            http_code: error.http_code,
        });

        let errorMessage = 'Failed to upload image';
        let errorCode = 'UPLOAD_ERROR';

        if (error.message.includes('timeout')) {
            errorMessage = 'Upload timeout. Please try again.';
            errorCode = 'TIMEOUT';
        } else if (error.message.includes('api_key')) {
            errorMessage = 'Server configuration error';
            errorCode = 'CONFIG_ERROR';
        } else if (error.http_code) {
            errorMessage = `Cloudinary error: ${error.message}`;
            errorCode = 'CLOUDINARY_ERROR';
        }

        return NextResponse.json(
            { 
                error: errorMessage,
                code: errorCode,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
