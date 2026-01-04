import axios from 'axios';

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
});

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        // Unwrap standard API response
        // Backend now returns { success: true, data: { ... }, message: "..." }
        // We set response.data to response.data.data to maintain compatibility with existing code
        if (response.data && response.data.success && response.data.data !== undefined) {
            response.data = response.data.data;
        } else if (response.data && response.data.success) {
            // Handle case where data might be null (e.g. void return) but success is true
            response.data = response.data.data || {};
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet, and it's NOT a login or register request
        const isAuthRequest = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint (cookie is sent automatically)
                await api.post('/auth/refresh-token');

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired or invalid) -> Logout
                // We can redirect to login or let the auth context handle it
                // Since we can't easily access context here, we might just reject
                // and let the AuthContext checkAuthStatus fail naturally or force reload.

                // Optional: Force reload to clear state if needed, or just let the app handle 401
                // window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
