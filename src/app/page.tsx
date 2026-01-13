'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { LoaderCircle } from 'lucide-react';

export default function HomePage() {
  const auth = useAuth();
  const { user, loading } = useUser(auth);
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until loading is complete

    if (!user) {
      // If no user is logged in, redirect to the login page.
      router.replace('/login');
    }
    // If the user is logged in, stay on this page.
    // The (app) layout will wrap this page and show the navigation.
    // The user can then choose where to go.
    // Let's redirect to the dashboard as a default landing spot within the app.
    router.replace('/dashboard');

  }, [user, loading, router]);

  // Show a loading spinner while checking auth state.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
