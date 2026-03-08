import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const DEVICE_KEY = 'wf_device_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpState, setOtpState] = useState(null); // { userId, email }

  useEffect(() => {
    const stored = localStorage.getItem('wf_user');
    if (!stored) { setLoading(false); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    api.get('/auth/me')
      .then(({ data }) => {
        const refreshed = { ...parsed, ...data };
        localStorage.setItem('wf_user', JSON.stringify(refreshed));
        setUser(refreshed);
      })
      .catch(() => { localStorage.removeItem('wf_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const persist = (data) => {
    localStorage.setItem('wf_user', JSON.stringify(data));
    setUser(data);
  };

  const updateUser = (updates) => {
    const current = JSON.parse(localStorage.getItem('wf_user') || '{}');
    const merged = { ...current, ...updates };
    localStorage.setItem('wf_user', JSON.stringify(merged));
    setUser(merged);
  };

  // Step 1: credentials → may return otp_required
  const login = async (email, password) => {
    const deviceToken = localStorage.getItem(DEVICE_KEY) || undefined;
    const { data } = await api.post('/auth/login', { email, password, deviceToken });
    if (data.step === 'otp_required') {
      setOtpState({ userId: data.userId, email: data.email });
      return data;
    }
    // Trusted device — direct login
    if (data.deviceToken) localStorage.setItem(DEVICE_KEY, data.deviceToken);
    persist(data);
    return data;
  };

  // Step 2: verify OTP
  const verifyOtp = async (userId, otp, rememberDevice = false) => {
    const { data } = await api.post('/auth/verify-otp', { userId, otp, rememberDevice });
    if (data.deviceToken) localStorage.setItem(DEVICE_KEY, data.deviceToken);
    setOtpState(null);
    persist(data);
    return data;
  };

  const resendOtp = async (userId) => {
    const { data } = await api.post('/auth/resend-otp', { userId });
    return data;
  };

  const clearOtpState = () => setOtpState(null);

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    persist(data);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('wf_user');
    setUser(null);
    setOtpState(null);
  }, []);

  const changePassword = async (currentPassword, newPassword) => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, verifyOtp, resendOtp, otpState, clearOtpState,
      register, logout, changePassword, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
