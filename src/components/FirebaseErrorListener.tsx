'use client';

import * as React from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a simple component that will listen for Firestore permission errors
// and display a toast notification to the user. In a real application, you might
// want to use a more sophisticated error handling strategy, but this is a good
// starting point.
export function FirebaseErrorListener() {
  const { toast } = useToast();

  React.useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a real app, you might want to log this error to a service like Sentry
      // or Bugsnag. For this demo, we'll just log it to the console and show a
      // toast notification.
      console.error('Firestore Permission Error:', error);
      
      // Throw the error in development to show the Next.js error overlay
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }

      toast({
        title: 'Permission Denied',
        description:
          "You don't have permission to perform this action. Check the console for more details.",
        variant: 'destructive',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
