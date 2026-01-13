'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { LoaderCircle } from 'lucide-react';

export default function HomePage() {
  const auth = useAuth();
  const { user, loading, role } = useUser(auth);
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until loading is complete

    if (!user) {
      // If no user is logged in, redirect to the login page.
      router.replace('/login');
    } else {
      // If a user is logged in, redirect them to their respective dashboard.
      // This is now the primary redirection point.
      if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'employee') {
        router.replace('/employee-dashboard');
      }
    }
  }, [user, loading, role, router]);

  // Show a loading spinner while checking auth state and redirecting.
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
