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
    // If the user is logged in, the (app) layout will handle rendering
    // the correct UI, including navigation. We will also be on the / route
    // and can navigate from there. Let's navigate to the dashboard as a default.
    // If a user is logged in, let's just go to the dashboard.
    router.replace('/dashboard');
    
  }, [user, loading, router]);

  // Show a loading spinner while checking auth state and redirecting.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
