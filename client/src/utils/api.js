import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status = err.response?.status;
    const data = err.response?.data;

    // Auto-refresh on 401 (not login/refresh endpoints)
    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh-token')) {
      const user = JSON.parse(localStorage.getItem('wf_user') || 'null');
      if (user?.refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data: tokens } = await axios.post('/api/auth/refresh-token', { refreshToken: user.refreshToken });
          const updated = { ...user, token: tokens.token, refreshToken: tokens.refreshToken };
          localStorage.setItem('wf_user', JSON.stringify(updated));
          processQueue(null, tokens.token);
          originalRequest.headers.Authorization = `Bearer ${tokens.token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('wf_user');
          if (!window.location.pathname.includes('/login')) window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('wf_user');
        if (!window.location.pathname.includes('/login')) window.location.href = '/login';
      }
    }

    // Suspended account
    if (status === 403 && data?.suspended) {
      localStorage.removeItem('wf_user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
