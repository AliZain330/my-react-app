import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const injectAdSenseScript = () => {
  const adsenseValue = process.env.REACT_APP_ADD_SENSE;
  if (!adsenseValue) return;

  let scriptSrc = '';

  if (adsenseValue.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    scriptSrc = adsenseValue;
  } else if (adsenseValue.includes('ca-pub-')) {
    scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseValue}`;
  } else if (adsenseValue.includes('src=')) {
    const match = adsenseValue.match(/src=["']([^"']+)["']/);
    if (match) {
      scriptSrc = match[1];
    }
  }

  if (!scriptSrc) return;

  const existing = document.querySelector(`script[src="${scriptSrc}"]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = scriptSrc;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
};

injectAdSenseScript();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
