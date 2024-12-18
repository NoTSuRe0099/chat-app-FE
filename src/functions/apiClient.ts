import axios, {
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  AxiosInstance,
} from 'axios';
import toast from 'react-hot-toast';
import { store } from '../store';
import { clearUser } from '../auth/AuthSlice';
import { startLoading, stopLoading } from '../reducers/UISlice';

// Define a common API response structure
interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

const apiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

export const publicApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  withCredentials: true,
});

apiInstance?.interceptors?.request?.use(
  (config) => {
    const token = store?.getState()?.authState?.access_token || '';
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Custom error handling function
const handleApiError = (error: AxiosError) => {
  let errorMessage = 'An unexpected error occurred';

  if (axios.isAxiosError(error)) {
    const axiosError: AxiosError = error;
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      errorMessage = `Status ${status}: ${data}`;
      // const access_token = store?.getState()?.authState?.access_token || '';
      if (status === 401) {
        localStorage.clear();
        store && store.dispatch(clearUser());
      }

      // @ts-ignore
      if (data?.message) toast.error(data?.message);
    } else if (axiosError.request) {
      errorMessage = 'No response received from the server';
    } else {
      errorMessage = 'Error setting up the request';
    }
  }

  console.error('API Client error:', error);
  return errorMessage;
};

// Define a type guard to check for the 'message' property in the data
const hasMessageProperty = <T>(data: any): data is T & { message: string } => {
  return typeof data?.message === 'string';
};

const callApi = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    store && store.dispatch(startLoading());
    const response: AxiosResponse<T> = await apiInstance(config);
    const { data } = response;
    store && store.dispatch(stopLoading());
    if (hasMessageProperty<T>(data)) {
      if (data.message?.trim()?.length) toast.success(data.message);
    }

    return { data };
  } catch (error: any) {
    store && store.dispatch(stopLoading());
    handleApiError(error);
    console.error('Error in API call:', error); // Log the actual error object for debugging
    throw error;
  }
};

export const callPublicApi = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    store && store.dispatch(startLoading());
    const response: AxiosResponse<T> = await publicApi(config);
    const { data } = response;

    store && store.dispatch(stopLoading());
    if (hasMessageProperty<T>(data)) {
      if (data.message?.trim()?.length) toast.success(data.message);
    }
    return { data };
  } catch (error: any) {
    store && store.dispatch(stopLoading());
    handleApiError(error);
    console.error('Error in API call:', error); // Log the actual error object for debugging
    throw error;
  }
};

export default callApi;
