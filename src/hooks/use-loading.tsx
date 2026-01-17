'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingState = {
  [key: string]: boolean;
};

type LoadingContextType = {
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  withLoading: <T extends any[]>(
    key: string,
    asyncFn: (...args: T) => Promise<any>
  ) => (...args: T) => Promise<any>;
};

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = React.useState<LoadingState>({});

  const setLoading = React.useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = React.useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = React.useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const withLoading = React.useCallback(<T extends any[]>(
    key: string,
    asyncFn: (...args: T) => Promise<any>
  ) => {
    return async (...args: T) => {
      setLoading(key, true);
      try {
        return await asyncFn(...args);
      } finally {
        setLoading(key, false);
      }
    };
  }, [setLoading]);

  const value = React.useMemo(() => ({
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
  }), [loadingStates, setLoading, isLoading, isAnyLoading, withLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = React.useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Loading Button Component
type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        // Base button styles
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Variant styles
        props.variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        props.variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        props.variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        props.variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        props.variant === 'link' && 'text-primary underline-offset-4 hover:underline',
        (!props.variant || props.variant === 'default') && 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Size styles
        props.size === 'sm' && 'h-9 rounded-md px-3',
        props.size === 'lg' && 'h-11 rounded-md px-8',
        props.size === 'icon' && 'h-10 w-10',
        (!props.size || props.size === 'default') && 'h-10 px-4 py-2',
        // Loading state styles
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
    >
      {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

// Loading Overlay Component
type LoadingOverlayProps = {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
};

export function LoadingOverlay({ 
  loading, 
  children, 
  className,
  loadingText = 'Loading...' 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            {loadingText}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading Spinner Component
type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <LoaderCircle className={cn('animate-spin', sizeClasses[size], className)} />
  );
}

// Hook for async operations with loading state
export function useAsyncOperation() {
  const { withLoading } = useLoading();

  const executeWithLoading = React.useCallback(
    async <T,>(
      key: string,
      operation: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void;
        onError?: (error: any) => void;
        successMessage?: string;
        errorMessage?: string;
      }
    ): Promise<T | undefined> => {
      try {
        const result = await withLoading(key, operation)();
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    },
    [withLoading]
  );

  return { executeWithLoading };
}

// Global Loading Indicator Component
export function GlobalLoadingIndicator() {
  const { isAnyLoading } = useLoading();

  if (!isAnyLoading()) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">Processing...</span>
        </div>
      </div>
    </div>
  );
}