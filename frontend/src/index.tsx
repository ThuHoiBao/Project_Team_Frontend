// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Nhớ import từ 'react-dom/client'
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter as Router } from 'react-router-dom';  // Import BrowserRouter
import 'bootstrap/dist/css/bootstrap.min.css';
import { LoginModalProvider } from './context/LoginContext';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from "@react-oauth/google";

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement); // Tạo root mới với createRoot


root.render(
  <Provider store={store}>
    <Router>
      <AuthProvider>
        <LoginModalProvider>
          <GoogleOAuthProvider clientId="398203653747-f108u093ieovejjrmht15m5j0hhk2cc7.apps.googleusercontent.com">
            <App />
          </GoogleOAuthProvider>
        </LoginModalProvider>
      </AuthProvider>
    </Router>
  </Provider>
);

