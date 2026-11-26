import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/caveat-brush/400.css';
import { router } from './app/router.jsx';
import { AuthProvider } from './app/providers/AuthProvider.jsx';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
