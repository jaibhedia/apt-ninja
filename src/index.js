import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AptosWalletProvider from './components/AptosWalletProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AptosWalletProvider>
      <App />
    </AptosWalletProvider>
  </React.StrictMode>
);