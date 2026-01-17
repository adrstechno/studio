import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/use-loading';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  loadingKey?: string;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
};

type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  success: boolean;
};

// React hook for API calls with loading and toast integration
export function useApiClient() {
  const { toast } = useToast();
  const { setLoading } = useLoading();

  const request = async <T = any>(
    url: string,
    options: ApiOptions & {
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      setLoading?: (loading: boolean) => void;
    } = {}
  ): Promise<ApiResponse<T>> => {
    const {
      method = 'GET',
      body,
      headers = {},
      loadingKey,
      onSuccess,
      onError,
      setLoading: customSetLoading,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorMessage,
    } = options;

    // Use global loading state if loadingKey is provided, otherwise use custom setLoading
    const loadingSetter = loadingKey ? 
      (loading: boolean) => setLoading(loadingKey, loading) : 
      customSetLoading;

    // Set loading state if available
    if (loadingSetter) {
      loadingSetter(true);
    }

    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Show success toast if enabled
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }

      onSuccess?.(data);

      return {
        data,
        success: true,
      };
    } catch (error: any) {
      const errorMsg = errorMessage || error.message || 'An error occurred';
      
      // Show error toast if enabled
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }

      onError?.(errorMsg);

      return {
        error: errorMsg,
        success: false,
      };
    } finally {
      // Clear loading state
      if (loadingSetter) {
        loadingSetter(false);
      }
    }
  };

  return {
    request,
    get: <T = any>(url: string, options?: Parameters<typeof request>[1]) =>
      request<T>(url, { ...options, method: 'GET' }),
    post: <T = any>(url: string, body?: any, options?: Parameters<typeof request>[1]) =>
      request<T>(url, { ...options, method: 'POST', body }),
    put: <T = any>(url: string, body?: any, options?: Parameters<typeof request>[1]) =>
      request<T>(url, { ...options, method: 'PUT', body }),
    delete: <T = any>(url: string, options?: Parameters<typeof request>[1]) =>
      request<T>(url, { ...options, method: 'DELETE' }),
    patch: <T = any>(url: string, body?: any, options?: Parameters<typeof request>[1]) =>
      request<T>(url, { ...options, method: 'PATCH', body }),
  };
}