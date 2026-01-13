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
    if (!loading) {
      if (user) {
        if (role === 'admin') {
          router.replace('/dashboard');
        } else if (role === 'employee') {
          router.replace('/employee-dashboard');
        } else {
          // If the role is still loading, we might wait, but if there's a user and no role, something is off.
          // For now, we'll default to login if the role isn't immediately available after user loads.
          // This can be improved with more specific loading states.
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, role, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
