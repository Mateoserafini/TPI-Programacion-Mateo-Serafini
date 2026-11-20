import React, { useEffect } from 'react';
import { AppRouter } from '@/routes/AppRouter';
import { useAuthStore } from '@/store/authStore';

export const App: React.FC = () => {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
};

export default App;
