'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee' | 'intern';
    employee?: any;
    intern?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    // Also store role in localStorage if not already there
                    if (!localStorage.getItem('userRole') && data.user.role) {
                        localStorage.setItem('userRole', data.user.role);
                    }
                } else {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userRole');
                }
            } catch (err) {
                console.error('Auth check error:', err);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Login failed');
            }

            const data = await response.json();

            // Store token and role in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.user.role);

            setUser(data.user);

            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push('/dashboard');
            } else if (data.user.role === 'intern') {
                router.push('/intern-dashboard');
            } else {
                router.push('/employee-dashboard');
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
