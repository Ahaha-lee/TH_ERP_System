import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import './index.css';

// Fix for Ant Design static function warnings
const originalError = console.error;
const originalWarn = console.warn;

const filterWarning = (msg) => {
  if (typeof msg === 'string' && (msg.includes('Static function can not consume context like dynamic theme') || msg.includes('Instance created by `useForm` is not connected to any Form element'))) {
    return true;
  }
  return false;
};

console.error = (...args) => {
  if (filterWarning(args[0])) return;
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (filterWarning(args[0])) return;
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
