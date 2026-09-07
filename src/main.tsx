import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toaster } from 'sonner';
import './index.css';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { EmployerProvider } from "./context/EmployerContext";


ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Toaster position='top-right' richColors />
          <AuthProvider>
             <EmployerProvider>
            <ProfileProvider>
              <App />
            </ProfileProvider>
            </EmployerProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
);
