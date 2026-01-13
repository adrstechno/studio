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
      // The user is logged in. The (app) layout will handle role-based rendering.
      // We can just stay on the root page which will be wrapped by the layout.
      // Or we can default to dashboard. For now, let's let the layout handle it,
      // and we just make sure unauthenticated users are sent to login.
       if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'employee') {
        router.replace('/employee-dashboard');
      }
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
