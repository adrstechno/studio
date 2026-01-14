import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a document
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string; docId: string }> }
) {
    try {
        const { docId } = await params;

        await db.projectDocument.delete({
            where: { id: docId },
        });

        return NextResponse.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}

// PATCH - Update a document
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ name: string; docId: string }> }
) {
    try {
        const { docId } = await params;
        const body = await request.json();
        const { title, type, content, fileUrl } = body;

        const document = await db.projectDocument.update({
            where: { id: docId },
            data: {
                ...(title && { title }),
                ...(type && { type }),
                ...(content !== undefined && { content }),
                ...(fileUrl !== undefined && { fileUrl }),
            },
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }
}
