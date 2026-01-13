'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LoaderCircle } from 'lucide-react';

export default function HomePage() {
  const { user, loading, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (role === 'admin') {
          router.replace('/dashboard');
        } else if (role === 'employee') {
          router.replace('/employee-dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, role, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
