import { useContext } from 'react';
import { AuthContext } from './AuthContext.js';

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return value;
}
