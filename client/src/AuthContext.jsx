import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cl_token'));
  const [student, setStudent] = useState(null);
  const [ready, setReady] = useState(!token);

  useEffect(() => {
    if (!token) return;
    api('/me', { token }).then(setStudent).catch(() => logout()).finally(() => setReady(true));
  }, []); // eslint-disable-line

  function login(data) {
    localStorage.setItem('cl_token', data.token);
    setToken(data.token); setStudent(data.student); setReady(true);
  }
  function logout() {
    localStorage.removeItem('cl_token');
    setToken(null); setStudent(null);
  }
  return <Ctx.Provider value={{ token, student, setStudent, login, logout, ready }}>{children}</Ctx.Provider>;
}
