// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <Web3Provider>
      <App />
    </Web3Provider>
  </AuthProvider>
);