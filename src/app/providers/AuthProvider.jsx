import { useEffect, useState } from 'react';
import { getAuthErrorMessage, subscribeToAuth } from '../../features/auth/auth.service.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToAuth(
      (nextUser) => {
        setUser(nextUser);
        setError('');
        setLoading(false);
      },
      (authError) => {
        setError(getAuthErrorMessage(authError));
        setLoading(false);
      },
    );
  }, []);

  return <AuthContext.Provider value={{ user, loading, error }}>{children}</AuthContext.Provider>;
}
