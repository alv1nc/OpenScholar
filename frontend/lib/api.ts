import axios from 'axios';

// In-memory token storage
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Needed if we were actually sending httpOnly cookies
});

// Request Interceptor: Attach the token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        const resp = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newToken = resp.data.accessToken; // Mocked API should return `{ accessToken: "..." }`
        
        // Save new token in memory
        setAccessToken(newToken);
        
        // Update the failed request header and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user is actually logged out
        setAccessToken(null);
        // We can emit an event here or let the context handle logout
        // For standard React apps we might dispatch an event to log the user out globally
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
