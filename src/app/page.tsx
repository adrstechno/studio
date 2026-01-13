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

    if (user) {
      if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'employee') {
        router.replace('/employee-dashboard');
      }
      // If role is still loading or null, we'll wait for the next effect run.
    } else {
      router.replace('/login');
    }
  }, [user, loading, role, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
