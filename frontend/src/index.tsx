// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Nhớ import từ 'react-dom/client'
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import { BrowserRouter as Router } from 'react-router-dom';  // Import BrowserRouter
import 'bootstrap/dist/css/bootstrap.min.css';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement); // Tạo root mới với createRoot

root.render(
  <Provider store={store}>
    <Router>  {/* Bao bọc App trong Router để sử dụng các hook của react-router-dom */}
      <App />
    </Router>
  </Provider>
);
